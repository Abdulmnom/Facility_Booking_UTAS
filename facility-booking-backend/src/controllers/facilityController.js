const { Facility } = require('../models');

exports.getAll = async (req, res) => {
  try {
    const facilities = await Facility.findAll({ where: { is_active: true }, order: [['name', 'ASC']] });
    return res.json(facilities);
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.create = async (req, res) => {
  const { name, type, capacity } = req.body;
  if (!name || !type || !capacity) {
    return res.status(400).json({ message: 'name, type, and capacity are required' });
  }
  try {
    const facility = await Facility.create({ name, type, capacity });
    return res.status(201).json(facility);
  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ message: 'Facility name already exists' });
    }
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const facility = await Facility.findByPk(req.params.id);
    if (!facility) return res.status(404).json({ message: 'Facility not found' });
    await facility.update(req.body);
    return res.json(facility);
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const facility = await Facility.findByPk(req.params.id);
    if (!facility) return res.status(404).json({ message: 'Facility not found' });
    await facility.update({ is_active: false });
    return res.json({ message: 'Facility deactivated' });
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};
