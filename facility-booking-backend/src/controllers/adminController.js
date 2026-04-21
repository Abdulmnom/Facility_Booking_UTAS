const { Op, fn, col, literal } = require('sequelize');
const { User, Booking, Facility, sequelize } = require('../models');

exports.getStats = async (req, res) => {
  try {
    const totalBookings = await Booking.count({ where: { status: { [Op.ne]: 'cancelled' } } });
    const totalUsers = await User.count({ where: { is_active: true } });
    const totalFacilities = await Facility.count({ where: { is_active: true } });

    // Bookings per facility
    const byFacility = await Booking.findAll({
      attributes: [
        'facility_id',
        [fn('COUNT', col('Booking.id')), 'count'],
      ],
      where: { status: { [Op.ne]: 'cancelled' } },
      include: [{ model: Facility, as: 'facility', attributes: ['name'] }],
      group: ['facility_id'],
      raw: false,
    });

    // Bookings per day (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const byDay = await Booking.findAll({
      attributes: [
        'booking_date',
        [fn('COUNT', col('id')), 'count'],
      ],
      where: {
        status: { [Op.ne]: 'cancelled' },
        booking_date: { [Op.gte]: thirtyDaysAgo.toISOString().split('T')[0] },
      },
      group: ['booking_date'],
      order: [['booking_date', 'ASC']],
      raw: true,
    });

    return res.json({
      totalBookings,
      totalUsers,
      totalFacilities,
      byFacility: byFacility.map(b => ({
        facilityName: b.facility ? b.facility.name : 'Unknown',
        count: parseInt(b.get('count'), 10),
      })),
      byDay,
    });
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ['id', 'name', 'email', 'role', 'is_active', 'createdAt'],
      order: [['createdAt', 'DESC']],
    });
    return res.json(users);
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.updateUserRole = async (req, res) => {
  const { role } = req.body;
  if (!['user', 'admin'].includes(role)) {
    return res.status(400).json({ message: 'Role must be user or admin' });
  }
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.id === req.user.id) {
      return res.status(400).json({ message: 'Cannot change your own role' });
    }
    await user.update({ role });
    return res.json({ id: user.id, name: user.name, email: user.email, role: user.role });
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.findAll({
      include: [
        { model: User, as: 'user', attributes: ['id', 'name', 'email'] },
        { model: Facility, as: 'facility', attributes: ['id', 'name', 'type'] },
      ],
      order: [['booking_date', 'DESC'], ['start_time', 'ASC']],
    });
    return res.json(bookings);
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.forceDeleteBooking = async (req, res) => {
  try {
    const booking = await Booking.findByPk(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    await booking.update({ status: 'cancelled' });
    return res.json({ message: 'Booking force-cancelled by admin' });
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};
