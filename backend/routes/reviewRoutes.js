const express = require('express');
const router = express.Router();
const { createReview, getBookReviews, updateReview, deleteReview } = require('../controllers/reviewController');
const { authenticateToken } = require('../middleware/authMiddleware');

router.post('/', authenticateToken, createReview);
router.get('/:bookId', getBookReviews);
router.put('/:id', authenticateToken, updateReview);
router.delete('/:id', authenticateToken, deleteReview);

module.exports = router;
