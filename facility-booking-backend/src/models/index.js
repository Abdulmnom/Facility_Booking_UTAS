const sequelize = require('../config/database');
const User = require('./User');
const Facility = require('./Facility');
const Booking = require('./Booking');

// Associations
User.hasMany(Booking, { foreignKey: 'user_id', as: 'bookings' });
Booking.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

Facility.hasMany(Booking, { foreignKey: 'facility_id', as: 'bookings' });
Booking.belongsTo(Facility, { foreignKey: 'facility_id', as: 'facility' });

const SEED_FACILITIES = [
  { name: 'Room A',       type: 'classroom', capacity: 30 },
  { name: 'Room B',       type: 'classroom', capacity: 30 },
  { name: 'Lab 1',        type: 'lab',       capacity: 20 },
  { name: 'Lab 2',        type: 'lab',       capacity: 20 },
  { name: 'Meeting Room', type: 'meeting',   capacity: 10 },
  { name: 'Sports Court', type: 'sports',    capacity: 50 },
];

async function syncAndSeed() {
  await sequelize.sync();
  for (const f of SEED_FACILITIES) {
    await Facility.findOrCreate({ where: { name: f.name }, defaults: f });
  }
  await User.findOrCreate({
    where: { email: 'admin@facility.com' },
    defaults: {
      name: 'Admin',
      email: 'admin@facility.com',
      password_hash: 'Admin@1234',
      role: 'admin',
      is_active: true,
    },
  });
  console.log('Database synced. Facilities seeded. Admin user ready.');
}

module.exports = { sequelize, User, Facility, Booking, syncAndSeed };
