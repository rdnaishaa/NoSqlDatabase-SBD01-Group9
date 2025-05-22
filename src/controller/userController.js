const User = require('../database/models/User');
const userRepository = require('../repository/userRepository');
const courseRepository = require('../repository/courseRepository');

// Get all users (admin only)
exports.getUsers = async (req, res) => {
  try {
    // Check if user is admin
    if (!userRepository.isAdmin(req.user)) {
      return res.status(403).json({
        success: false,
        error: 'Only administrators can view all users',
      });
    }

    const users = await userRepository.getAllUsers();

    res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

// Enroll in course
exports.enrollInCourse = async (req, res) => {
    try {
        const { course, user } = await courseRepository.enrollStudent(
            req.params.courseId,
            req.user.id
        );

        res.status(200).json({
            success: true,
            data: { course, user }
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
};