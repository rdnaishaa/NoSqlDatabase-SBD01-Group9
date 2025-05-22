const express = require('express');
const { getUsers, enrollInCourse } = require('../controller/userController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');

const router = express.Router();

// Protected admin routes
router.get('/', protect, authorize('admin'), getUsers);

// Protected student routes
router.post('/enroll/:courseId', protect, authorize('student'), enrollInCourse);

module.exports = router;