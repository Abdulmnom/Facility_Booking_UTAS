require('dotenv').config();
const app = require('./src/app');
const { syncAndSeed, sequelize } = require('./src/models');

const PORT = process.env.PORT || 5000;

syncAndSeed()
  .then(() => {
    const server = app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

    // Graceful shutdown — ensures SQLite releases its file lock cleanly before
    // the process exits. Without this, node --watch restarts leave a stale WAL
    // lock that causes SQLITE_BUSY in the new process for up to busy_timeout ms.
    const shutdown = async (signal) => {
      console.log(`${signal} received — closing server and database...`);
      server.close(async () => {
        try {
          await sequelize.close();
          console.log('Database connection closed. Exiting.');
        } catch (err) {
          console.error('Error closing database:', err.message);
        }
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT',  () => shutdown('SIGINT'));
  })
  .catch((err) => {
    console.error('Failed to start server:', err);
    process.exit(1);
  });
