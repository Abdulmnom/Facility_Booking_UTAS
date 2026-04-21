const router = require('express').Router();
const facilityController = require('../controllers/facilityController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

router.get('/', facilityController.getAll);
router.post('/', authMiddleware, adminMiddleware, facilityController.create);
router.put('/:id', authMiddleware, adminMiddleware, facilityController.update);
router.delete('/:id', authMiddleware, adminMiddleware, facilityController.remove);

module.exports = router;
