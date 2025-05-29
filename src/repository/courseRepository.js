const Course = require('../database/models/Course');
const User = require('../database/models/User');
const Progress = require('../database/models/Progress');

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
    },

    // Get user progress for a course
    getUserCourseProgress: async (userId, courseId) => {
        let progress = await Progress.findOne({ user: userId, course: courseId });
        if (!progress) {
            return { hoursSpent: 0, lastAccess: null, currentPage: 0, totalPages: 1, isCompleted: false };
        }
        // Completed hanya jika currentPage >= totalPages dan totalPages > 0
        return {
            ...progress.toObject(),
            isCompleted: progress.currentPage >= progress.totalPages && progress.totalPages > 0
        };
    },

    // Add 1 hour to user progress for a course
    addHourToUserCourse: async (userId, courseId) => {
        let progress = await Progress.findOne({ user: userId, course: courseId });
        if (!progress) {
            progress = new Progress({ user: userId, course: courseId, hoursSpent: 1, lastAccess: new Date() });
        } else {
            progress.hoursSpent += 1;
            progress.lastAccess = new Date();
        }
        await progress.save();
        return progress;
    },

    // Update user course page progress
    updateUserCoursePage: async (userId, courseId, page, totalPages) => {
        let progress = await Progress.findOne({ user: userId, course: courseId });
        if (!progress) {
            progress = new Progress({ user: userId, course: courseId, currentPage: page, totalPages });
        } else {
            progress.currentPage = page;
            progress.totalPages = totalPages;
            progress.lastAccess = new Date();
        }
        await progress.save();
        return progress;
    },

    // Admin: Get all user activities (progress on all courses)
    getAllUserActivities: async () => {
        const activities = await Progress.find()
            .populate('user', 'name email')
            .populate('course', 'title')
            .lean();
        return activities.map(act => ({
            _id: act._id,
            userName: act.user?.name,
            userEmail: act.user?.email,
            courseTitle: act.course?.title,
            currentPage: act.currentPage,
            totalPages: act.totalPages,
            progressPercent: act.totalPages && act.totalPages > 0 ? Math.round((act.currentPage / act.totalPages) * 100) : 0,
            isCompleted: act.currentPage >= act.totalPages && act.totalPages > 0,
            lastAccess: act.lastAccess
        }));
    }
};

module.exports = courseRepository;