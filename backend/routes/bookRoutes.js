const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { getAllBooks, getBookById, createBook, updateBook, deleteBook, getCategories, createCategory, getAuthors, createAuthor } = require('../controllers/bookController');
const { authenticateToken, requireAdmin } = require('../middleware/authMiddleware');
const { validateBook } = require('../middleware/validator');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/covers/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Only image files are allowed'));
  }
});

router.get('/', getAllBooks);
router.get('/categories', getCategories);
router.get('/authors', getAuthors);
router.get('/:id', getBookById);
router.post('/', authenticateToken, requireAdmin, upload.single('cover_image'), validateBook, createBook);
router.put('/:id', authenticateToken, requireAdmin, upload.single('cover_image'), updateBook);
router.delete('/:id', authenticateToken, requireAdmin, deleteBook);
router.post('/categories', authenticateToken, requireAdmin, createCategory);
router.post('/authors', authenticateToken, requireAdmin, createAuthor);

module.exports = router;
