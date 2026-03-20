const express = require('express');
const router = express.Router();
const { borrowBook, returnBook, getUserBorrows, getBorrowById, getAllBorrows } = require('../controllers/borrowController');
const { authenticateToken, requireAdmin } = require('../middleware/authMiddleware');

router.post('/', authenticateToken, borrowBook);
router.get('/', authenticateToken, requireAdmin, getAllBorrows);
router.get('/user/:userId', authenticateToken, getUserBorrows);
router.get('/:id', authenticateToken, getBorrowById);
router.put('/:id/return', authenticateToken, returnBook);

module.exports = router;
