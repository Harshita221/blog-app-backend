const { Router } = require('express');
const {
  createPost,
  getPosts,
  getCatPosts,
  getPost,
  getUserPosts,
  editPost,
  deletePost,
} = require('../controllers/postControllers');

const authMiddleware = require('../middleware/authMiddleware');
const router = Router();

// Create a new post
router.post('/', authMiddleware, createPost); // Requires authentication

// Get all posts
router.get('/', getPosts); // No authentication required

// Get a single post by ID
router.get('/:id', getPost); // No authentication required

// Edit a post by ID
router.patch('/:id', authMiddleware, editPost); // Requires authentication

// Get posts by category
router.get('/categories/:category', getCatPosts); // No authentication required

// Get posts by user ID
router.get('/users/:id', getUserPosts); // No authentication required

// Delete a post by ID
router.delete('/:id', authMiddleware, deletePost); // Requires authentication

module.exports = router;
