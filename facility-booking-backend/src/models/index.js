const sequelize = require('../config/database');
const User = require('./User');
const Facility = require('./Facility');
const Booking = require('./Booking');

// Associations
User.hasMany(Booking, { foreignKey: 'user_id', as: 'bookings' });
Booking.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

Facility.hasMany(Booking, { foreignKey: 'facility_id', as: 'bookings' });
Booking.belongsTo(Facility, { foreignKey: 'facility_id', as: 'facility' });

async function syncAndSeed() {
  await sequelize.sync();
  console.log('Database synced.');
}

module.exports = { sequelize, User, Facility, Booking, syncAndSeed };
