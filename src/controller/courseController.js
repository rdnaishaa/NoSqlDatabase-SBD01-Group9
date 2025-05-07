const Course = require('../database/models/Course');
const User = require('../database/models/User');
const courseRepository = require('../repository/courseRepository');

// Get all courses
exports.getCourses = async (req, res) => {
  try {
    const courses = await courseRepository.getAllCourses();
    
    res.status(200).json({
      success: true,
      count: courses.length,
      data: courses,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

// Get single course
exports.getCourse = async (req, res) => {
  try {
    const course = await courseRepository.getCourseById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        error: 'Course not found',
      });
    }

    res.status(200).json({
      success: true,
      data: course,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

// Create new course (admin only)
exports.createCourse = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Only administrators can create courses',
      });
    }

    const course = await courseRepository.createCourse(req.body);

    res.status(201).json({
      success: true,
      data: course,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

// Update course (admin only)
exports.updateCourse = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Only administrators can update courses',
      });
    }

    const course = await courseRepository.updateCourse(req.params.id, req.body);

    if (!course) {
      return res.status(404).json({
        success: false,
        error: 'Course not found',
      });
    }

    res.status(200).json({
      success: true,
      data: course,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

// Delete course (admin only)
exports.deleteCourse = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Only administrators can delete courses',
      });
    }

    const course = await courseRepository.deleteCourse(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        error: 'Course not found',
      });
    }

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

// Enroll in a course (student only)
exports.enrollCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    const user = await User.findById(req.user.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        error: 'Course not found',
      });
    }

    // Check if student is already enrolled
    if (user.enrolledCourses.includes(course._id)) {
      return res.status(400).json({
        success: false,
        error: 'Student already enrolled in this course',
      });
    }

    // Add course to student's enrolled courses
    user.enrolledCourses.push(course._id);
    await user.save();

    // Add student to course's enrolled students
    course.enrolledStudents.push(user._id);
    await course.save();

    res.status(200).json({
      success: true,
      data: { course, user },
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};