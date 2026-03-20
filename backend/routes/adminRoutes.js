const express = require('express');
const router = express.Router();
const { getDashboard, getBooksReport, getUsersReport, getBorrowsReport, getAdminLogs } = require('../controllers/adminController');
const { authenticateToken, requireAdmin } = require('../middleware/authMiddleware');

router.use(authenticateToken, requireAdmin);

router.get('/dashboard', getDashboard);
router.get('/reports/books', getBooksReport);
router.get('/reports/users', getUsersReport);
router.get('/reports/borrows', getBorrowsReport);
router.get('/logs', getAdminLogs);

module.exports = router;
