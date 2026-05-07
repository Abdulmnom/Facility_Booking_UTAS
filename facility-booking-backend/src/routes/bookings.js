const router = require('express').Router();
const { body, validationResult } = require('express-validator');
const bookingController = require('../controllers/bookingController');
const authMiddleware = require('../middleware/authMiddleware');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
  }
  next();
};

const bookingValidators = [
  body('facility_id')
    .notEmpty().withMessage('facility_id is required')
    .isInt({ min: 1 }).withMessage('facility_id must be a positive integer')
    .toInt(),
  body('booking_date')
    .notEmpty().withMessage('booking_date is required')
    .isISO8601().withMessage('booking_date must be a valid date (YYYY-MM-DD)'),
  body('start_time')
    .notEmpty().withMessage('start_time is required')
    .matches(/^\d{2}:\d{2}$/).withMessage('start_time must be HH:MM'),
  body('end_time')
    .notEmpty().withMessage('end_time is required')
    .matches(/^\d{2}:\d{2}$/).withMessage('end_time must be HH:MM'),
  body('purpose')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 255 }).withMessage('purpose must be 255 characters or fewer'),
];

router.use(authMiddleware);

router.get('/availability', bookingController.checkAvailability);
router.get('/', bookingController.getMyBookings);
router.post('/', bookingValidators, validate, bookingController.createBooking);
router.put('/:id', bookingController.updateBooking);
router.delete('/:id', bookingController.deleteBooking);

module.exports = router;
