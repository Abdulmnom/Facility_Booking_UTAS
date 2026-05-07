const express = require('express');
const cors = require('cors');
const { ValidationError, UniqueConstraintError, ForeignKeyConstraintError } = require('sequelize');

const app = express();

app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(express.json());

app.use('/api/auth', require('./routes/auth'));
app.use('/api/facilities', require('./routes/facilities'));
app.use('/api/bookings', require('./routes/bookings'));
app.use('/api/admin', require('./routes/admin'));

// Global error handler — reached only when a controller calls next(err) or throws outside try/catch
app.use((err, req, res, next) => {
  console.error(`[${new Date().toISOString()}] ${req.method} ${req.path}`, err);

  if (err instanceof ValidationError) {
    return res.status(400).json({
      message: 'Validation error',
      errors: err.errors.map((e) => ({ field: e.path, message: e.message })),
    });
  }
  if (err instanceof UniqueConstraintError) {
    return res.status(409).json({ message: 'A record with those values already exists' });
  }
  if (err instanceof ForeignKeyConstraintError) {
    return res.status(400).json({ message: 'Referenced record does not exist' });
  }

  res.status(500).json({ message: 'Internal server error' });
});

module.exports = app;
