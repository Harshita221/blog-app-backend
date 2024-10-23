const { Router } = require('express');
const {
  registerUser,
  loginUser,
  getAuthors,
  getUser,
  changeAvatar,
  editUser,
} = require('../controllers/userControllers');

const authMiddleware = require('../middleware/authMiddleware');
const router = Router();

// User Registration
router.post('/register', registerUser); // No authentication required

// User Login
router.post('/login', loginUser); // No authentication required

// Get all authors
router.get('/', getAuthors); // No authentication required

// Get a single user by ID
router.get('/:id', getUser); // No authentication required

// Change user avatar (PATCH to reflect the update operation)
router.patch('/change-avatar', authMiddleware, changeAvatar); // Requires authentication

// Edit user details
router.patch('/edit-user', authMiddleware, editUser); // Requires authentication

module.exports = router;
