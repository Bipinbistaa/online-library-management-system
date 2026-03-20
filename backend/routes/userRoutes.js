const express = require('express');
const router = express.Router();
const { getProfile, updateProfile, getAllUsers, updateUser } = require('../controllers/userController');
const { authenticateToken, requireAdmin } = require('../middleware/authMiddleware');

router.get('/profile', authenticateToken, getProfile);
router.put('/profile', authenticateToken, updateProfile);
router.get('/', authenticateToken, requireAdmin, getAllUsers);
router.put('/:id', authenticateToken, requireAdmin, updateUser);

module.exports = router;
