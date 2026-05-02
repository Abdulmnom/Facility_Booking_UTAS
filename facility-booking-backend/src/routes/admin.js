const router = require('express').Router();
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

router.use(authMiddleware, adminMiddleware);

router.get('/stats', adminController.getStats);
router.get('/users', adminController.getUsers);
router.get('/bookings', adminController.getAllBookings);
router.put('/bookings/:id/approve', adminController.approveBooking);
router.delete('/bookings/:id', adminController.forceDeleteBooking);

module.exports = router;
