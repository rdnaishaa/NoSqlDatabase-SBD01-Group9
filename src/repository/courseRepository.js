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

        if (user.enrolledCourses.includes(course._id)) {
            throw new Error('Student already enrolled in this course');
        }

        user.enrolledCourses.push(course._id);
        course.enrolledStudents.push(user._id);

        await Promise.all([user.save(), course.save()]);

        return { course, user };
    }
};

module.exports = courseRepository;