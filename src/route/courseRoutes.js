const express = require('express');
const { 
  getCourses, getCourse, createCourse, updateCourse, deleteCourse,
  getUserCourseProgress, addHourToUserCourse, getAllUserActivities, updateUserCoursePage,
  unenrollCourse
} = require('../controller/courseController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');

const router = express.Router();

router.use(protect);

router.get('/', getCourses); 
// Progress routes
router.get('/progress/:courseId', getUserCourseProgress);
router.post('/progress/:courseId/add-hour', addHourToUserCourse);
router.post('/progress/:courseId/page', updateUserCoursePage);
// Admin user activities
router.get('/admin/user-activities', authorize('admin'), getAllUserActivities);
router.get('/:id', getCourse); 
router.post('/', authorize('admin'), createCourse); 
router.put('/:id', authorize('admin'), updateCourse); 
router.delete('/:id', authorize('admin'), deleteCourse);
router.post('/:id/unenroll', unenrollCourse);

module.exports = router;