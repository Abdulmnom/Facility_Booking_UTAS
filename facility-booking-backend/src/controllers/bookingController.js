const { Op } = require('sequelize');
const { Booking, Facility, User } = require('../models');
const { sendBookingConfirmation } = require('../services/emailService');

exports.getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.findAll({
      where: { user_id: req.user.id },
      include: [{ model: Facility, as: 'facility' }],
      order: [['booking_date', 'DESC'], ['start_time', 'ASC']],
    });
    return res.json(bookings);
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.checkAvailability = async (req, res) => {
  // Accept both camelCase (frontend) and snake_case (direct API callers)
  const facility_id  = req.query.facility_id  ?? req.query.facilityId;
  const booking_date = req.query.booking_date ?? req.query.date;
  const start_time   = req.query.start_time   ?? req.query.start;
  const end_time     = req.query.end_time     ?? req.query.end;
  const exclude_id   = req.query.exclude_id   ?? null;

  if (!facility_id || !booking_date || !start_time || !end_time) {
    return res.status(400).json({ message: 'facility_id, booking_date, start_time, end_time are required' });
  }
  try {
    const whereClause = {
      facility_id,
      booking_date,
      status: { [Op.in]: ['pending', 'confirmed'] },
      [Op.or]: [
        { start_time: { [Op.lt]: end_time }, end_time: { [Op.gt]: start_time } },
      ],
    };

    // Exclude the current booking when checking availability during an edit
    if (exclude_id) {
      whereClause.id = { [Op.ne]: Number(exclude_id) };
    }

    const conflict = await Booking.findOne({ where: whereClause });
    return res.json({ available: !conflict });
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.createBooking = async (req, res) => {
  const { facility_id, booking_date, start_time, end_time, purpose } = req.body;
  if (!facility_id || !booking_date || !start_time || !end_time) {
    return res.status(400).json({ message: 'facility_id, booking_date, start_time, end_time are required' });
  }
  try {
    // Conflict detection
    const conflict = await Booking.findOne({
      where: {
        facility_id,
        booking_date,
        status: { [Op.in]: ['pending', 'confirmed'] },
        [Op.or]: [
          { start_time: { [Op.lt]: end_time }, end_time: { [Op.gt]: start_time } },
        ],
      },
    });
    if (conflict) {
      return res.status(409).json({ message: 'This time slot is already booked for that facility' });
    }

    const booking = await Booking.create({
      user_id: req.user.id,
      facility_id,
      booking_date,
      start_time,
      end_time,
      purpose,
    });

    const fullBooking = await Booking.findByPk(booking.id, {
      include: [{ model: Facility, as: 'facility' }],
    });

    // Send email (non-blocking)
    try {
      const user = await User.findByPk(req.user.id);
      await sendBookingConfirmation(user, fullBooking, fullBooking.facility);
      await booking.update({ email_sent: true });
    } catch (emailErr) {
      console.error('Email sending failed:', emailErr.message);
    }

    return res.status(201).json(fullBooking);
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.updateBooking = async (req, res) => {
  try {
    const booking = await Booking.findByPk(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (booking.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to edit this booking' });
    }
    if (booking.status === 'cancelled') {
      return res.status(400).json({ message: 'Cannot edit a cancelled booking' });
    }

    const { facility_id, booking_date, start_time, end_time, purpose } = req.body;
    const newFacility = facility_id || booking.facility_id;
    const newDate = booking_date || booking.booking_date;
    const newStart = start_time || booking.start_time;
    const newEnd = end_time || booking.end_time;

    // Conflict check excluding current booking
    const conflict = await Booking.findOne({
      where: {
        facility_id: newFacility,
        booking_date: newDate,
        status: { [Op.in]: ['pending', 'confirmed'] },
        id: { [Op.ne]: booking.id },
        [Op.or]: [
          { start_time: { [Op.lt]: newEnd }, end_time: { [Op.gt]: newStart } },
        ],
      },
    });
    if (conflict) {
      return res.status(409).json({ message: 'This time slot is already booked' });
    }

    await booking.update({ facility_id: newFacility, booking_date: newDate, start_time: newStart, end_time: newEnd, purpose });
    const updated = await Booking.findByPk(booking.id, { include: [{ model: Facility, as: 'facility' }] });
    return res.json(updated);
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.deleteBooking = async (req, res) => {
  try {
    const booking = await Booking.findByPk(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (booking.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    await booking.update({ status: 'cancelled' });
    return res.json({ message: 'Booking cancelled' });
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};
