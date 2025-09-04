// routes/userRoutes.js
const express = require('express');
const {
  registerUser,
  loginUser,
  logoutUser,
  getUserProfile,
  updateUserProfile,
  changePassword,
  refreshToken
} = require('../Controllers/user');
const { protect, authorize } = require('../middleware/auth');
const { validateRegister, validateLogin, validatePasswordChange } = require('../middleware/validation');

const router = express.Router();

// Public routes
router.post('/register', validateRegister, registerUser);
router.post('/login', validateLogin, loginUser);
router.post('/refresh-token', refreshToken);

// Protected routes
router.post('/logout', protect, logoutUser);
router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);
router.put('/change-password', protect, validatePasswordChange, changePassword);

// Admin only routes (example)
router.get('/admin/users', protect, authorize('admin'), async (req, res) => {
  try {
    const { User } = require('../models');
    const users = await User.find({}, '-password -refreshToken');
    
    res.json({
      success: true,
      data: { users }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error fetching users'
    });
  }
});

module.exports = router;