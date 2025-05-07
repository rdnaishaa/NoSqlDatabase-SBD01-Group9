const express = require('express');
const { getCourses, getCourse, createCourse, updateCourse, deleteCourse } = require('../controller/courseController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');

const router = express.Router();

router.use(protect);

router.get('/', getCourses); 
router.get('/:id', getCourse); 
router.post('/', authorize('admin'), createCourse); 
router.put('/:id', authorize('admin'), updateCourse); 
router.delete('/:id', authorize('admin'), deleteCourse);

module.exports = router;