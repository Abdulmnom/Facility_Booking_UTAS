const { Sequelize } = require('sequelize');
const path = require('path');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: process.env.DATABASE_STORAGE || path.join(__dirname, '../../bookings.db'),
  logging: false,
  pool: {
    max: 1,           // SQLite is a single-writer file — only ONE connection ever.
                      // Setting max > 1 causes multiple connections to race for the
                      // file lock, producing SQLITE_BUSY on every concurrent request.
    min: 1,           // Keep the connection alive permanently (never recreate it).
                      // With min:0 the connection was destroyed after idle timeout and
                      // PRAGMAs were lost until afterConnect re-ran, leaving a window
                      // where busy_timeout=0 and SQLITE_BUSY fired instantly.
    acquire: 60000,   // Wait up to 60 s to acquire the connection
    idle: 10000, // Max int — never idle-destroy the persistent connection
  },
});

// PRAGMAs are applied once when the persistent connection is created at startup.
// With min:1 this hook runs exactly once and the settings are never lost.
sequelize.afterConnect(async (connection) => {
  // WAL mode: readers never block writers and writers never block readers.
  // Eliminates SQLITE_BUSY from concurrent SELECT + INSERT/UPDATE pairs.
  await new Promise((resolve, reject) =>
    connection.run('PRAGMA journal_mode=WAL;', (err) => (err ? reject(err) : resolve()))
  );
  // If an external process (e.g. old node --watch instance during restart) holds
  // a write lock, SQLite retries internally for up to 15 seconds before giving up.
  await new Promise((resolve, reject) =>
    connection.run('PRAGMA busy_timeout=15000;', (err) => (err ? reject(err) : resolve()))
  );
  // NORMAL is safe with WAL and avoids the extra fsync of FULL synchronous mode.
  await new Promise((resolve, reject) =>
    connection.run('PRAGMA synchronous=NORMAL;', (err) => (err ? reject(err) : resolve()))
  );
});

module.exports = sequelize;
