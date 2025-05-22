const Course = require('../database/models/Course');
const User = require('../database/models/User');

const courseRepository = {
    // Get all courses
    getAllCourses: async () => {
        return await Course.find();
    },

    // Get course by ID
    getCourseById: async (id) => {
        return await Course.findById(id);
    },

    // Create new course
    createCourse: async (courseData) => {
        return await Course.create(courseData);
    },

    // Update course
    updateCourse: async (id, courseData) => {
        return await Course.findByIdAndUpdate(id, courseData, {
            new: true,
            runValidators: true
        });
    },

    // Delete course
    deleteCourse: async (id) => {
        return await Course.findByIdAndDelete(id);
    },

    // Enroll student in course
    enrollStudent: async (courseId, userId) => {
        const course = await Course.findById(courseId);
        const user = await User.findById(userId);

        if (!course || !user) {
            throw new Error('Course or User not found');
        }

        // Validate user is a student
        if (user.role !== 'student') {
            throw new Error('Only students can enroll in courses');
        }

        // Check if already enrolled using toString() for proper comparison
        if (user.enrolledCourses.some(id => id.toString() === courseId.toString())) {
            throw new Error('Student already enrolled in this course');
        }

        // Add references to both documents
        user.enrolledCourses.push(courseId);
        course.enrolledStudents.push(userId);

        // Save both documents
        await Promise.all([user.save(), course.save()]);

        // Return populated course and user
        return {
            course: await Course.findById(courseId).populate('enrolledStudents'),
            user: await User.findById(userId).populate('enrolledCourses')
        };
    }
};

module.exports = courseRepository;