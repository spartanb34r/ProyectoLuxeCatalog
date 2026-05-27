const express = require('express');

const router = express.Router();

const { verifyToken } = require('../middleware/auth.middleware');

const {
  getProfile,
  getOrderHistory
} = require('../controllers/user.controller');

router.get(
  '/profile',
  verifyToken,
  getProfile
);

router.get(
  '/history',
  verifyToken,
  getOrderHistory
);

module.exports = router;