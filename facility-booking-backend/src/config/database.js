const { Sequelize } = require('sequelize');
const path = require('path');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, '../../bookings.db'),
  logging: false,
  pool: {
    max: 1,       // SQLite is single-writer — one connection prevents SQLITE_BUSY
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
});

// Enable WAL journal mode and busy_timeout on every new connection.
// WAL allows concurrent reads while a write is in progress; busy_timeout
// adds a 5-second retry inside SQLite for any external process contention.
sequelize.afterConnect(async (connection) => {
  await new Promise((resolve, reject) =>
    connection.run('PRAGMA journal_mode=WAL;', (err) => (err ? reject(err) : resolve()))
  );
  await new Promise((resolve, reject) =>
    connection.run('PRAGMA busy_timeout=5000;', (err) => (err ? reject(err) : resolve()))
  );
});

module.exports = sequelize;
