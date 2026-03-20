const validator = require('validator');

const validateRegister = (req, res, next) => {
  const { username, email, password, full_name } = req.body;

  if (!username || !email || !password || !full_name) {
    return res.status(400).json({ message: 'All required fields must be provided' });
  }

  if (!validator.isEmail(email)) {
    return res.status(400).json({ message: 'Invalid email format' });
  }

  if (password.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters' });
  }

  if (username.length < 3 || username.length > 50) {
    return res.status(400).json({ message: 'Username must be between 3 and 50 characters' });
  }

  next();
};

const validateLogin = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  if (!validator.isEmail(email)) {
    return res.status(400).json({ message: 'Invalid email format' });
  }

  next();
};

const validateBook = (req, res, next) => {
  const { title, authorId, categoryId, isbn, total_copies } = req.body;

  if (!title || !authorId || !categoryId || !isbn || !total_copies) {
    return res.status(400).json({ message: 'All required book fields must be provided' });
  }

  if (total_copies < 1) {
    return res.status(400).json({ message: 'Total copies must be at least 1' });
  }

  next();
};

module.exports = { validateRegister, validateLogin, validateBook };
