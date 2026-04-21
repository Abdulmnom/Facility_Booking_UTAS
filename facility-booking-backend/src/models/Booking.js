const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Booking = sequelize.define('Booking', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  user_id: { type: DataTypes.INTEGER, allowNull: false },
  facility_id: { type: DataTypes.INTEGER, allowNull: false },
  booking_date: { type: DataTypes.DATEONLY, allowNull: false },
  start_time: { type: DataTypes.STRING(5), allowNull: false },
  end_time: { type: DataTypes.STRING(5), allowNull: false },
  purpose: { type: DataTypes.STRING(255), allowNull: true },
  status: { type: DataTypes.ENUM('pending', 'confirmed', 'cancelled'), defaultValue: 'pending' },
  email_sent: { type: DataTypes.BOOLEAN, defaultValue: false },
}, {
  tableName: 'bookings',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['facility_id', 'booking_date', 'start_time'],
      where: { status: ['pending', 'confirmed'] },
    },
  ],
});

module.exports = Booking;
