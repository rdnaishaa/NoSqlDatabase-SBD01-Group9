
import api from '../utils/api';

const courseService = {
  // Get all courses
  getAllCourses: async () => {
    try {
      const response = await api.get('/courses');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get a single course by id
  getCourseById: async (id) => {
    try {
      const response = await api.get(`/courses/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Create a new course (admin only)
  createCourse: async (courseData) => {
    try {
      const response = await api.post('/courses', courseData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update a course (admin only)
  updateCourse: async (id, courseData) => {
    try {
      const response = await api.put(`/courses/${id}`, courseData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Delete a course (admin only)
  deleteCourse: async (id) => {
    try {
      const response = await api.delete(`/courses/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Enroll in a course (student only)
  enrollCourse: async (id) => {
    try {
      const response = await api.post(`/courses/${id}/enroll`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default courseService;