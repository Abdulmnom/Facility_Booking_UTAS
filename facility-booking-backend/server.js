require('dotenv').config();
const app = require('./src/app');
const { syncAndSeed } = require('./src/models');

const PORT = process.env.PORT || 5000;

syncAndSeed()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to start server:', err);
    process.exit(1);
  });
