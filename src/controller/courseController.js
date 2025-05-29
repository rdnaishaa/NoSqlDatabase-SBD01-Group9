const Course = require('../database/models/Course');
const User = require('../database/models/User');
const courseRepository = require('../repository/courseRepository');

// --- COURSES --- //

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

// Unenroll from a course (student only)
exports.unenrollCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    const user = await User.findById(req.user.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        error: 'Course not found',
      });
    }

    // Check if student is enrolled
    if (!user.enrolledCourses.includes(course._id)) {
      return res.status(400).json({
        success: false,
        error: 'You are not enrolled in this course',
      });
    }

    // Remove course from user's enrolledCourses
    user.enrolledCourses = user.enrolledCourses.filter(cid => cid.toString() !== course._id.toString());
    await user.save();

    // Remove user from course's enrolledStudents
    course.enrolledStudents = course.enrolledStudents.filter(uid => uid.toString() !== user._id.toString());
    await course.save();

    res.status(200).json({
      success: true,
      message: 'Successfully unenrolled from course',
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// --- PROGRESS & USER ACTIVITIES ---

// Get user progress for a course
exports.getUserCourseProgress = async (req, res) => {
  try {
    const userId = req.user.id;
    const courseId = req.params.courseId;
    const progress = await courseRepository.getUserCourseProgress(userId, courseId);
    // Pastikan hanya progress halaman yang menentukan completed
    const isCompleted = progress && progress.currentPage >= progress.totalPages && progress.totalPages > 0;
    res.status(200).json({ success: true, data: { ...progress, isCompleted } });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// Add 1 hour to user progress for a course
exports.addHourToUserCourse = async (req, res) => {
  try {
    const userId = req.user.id;
    const courseId = req.params.courseId;
    const progress = await courseRepository.addHourToUserCourse(userId, courseId);
    res.status(200).json({ success: true, data: progress });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// Admin: Get all user activities (progress on all courses)
exports.getAllUserActivities = async (req, res) => {
  try {
    if (!req.user.role || req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Only admin can access this' });
    }
    const activities = await courseRepository.getAllUserActivities();
    // Tambahkan progress percent dan completed di sini
    const mapped = activities.map(act => ({
      ...act,
      progressPercent: act.totalPages && act.totalPages > 0 ? Math.round((act.currentPage / act.totalPages) * 100) : 0,
      isCompleted: act.currentPage >= act.totalPages && act.totalPages > 0
    }));
    res.status(200).json({ success: true, data: mapped });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// Update user course page progress
exports.updateUserCoursePage = async (req, res) => {
  try {
    const userId = req.user.id;
    const courseId = req.params.courseId;
    const { page, totalPages } = req.body;
    const progress = await courseRepository.updateUserCoursePage(userId, courseId, page, totalPages);
    res.status(200).json({ success: true, data: progress });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};