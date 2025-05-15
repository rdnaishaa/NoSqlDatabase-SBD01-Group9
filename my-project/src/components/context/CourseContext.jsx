import React, { createContext, useContext, useState } from 'react';

const CourseContext = createContext();

export const CourseProvider = ({ children }) => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);

  const getCourses = async () => {
    setLoading(true);
    try {
      // TODO: Implement API call to fetch courses
      const response = await fetch('/api/courses');
      const data = await response.json();
      setCourses(data);
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCourseById = async (id) => {
    try {
      const response = await fetch(`/api/courses/${id}`);
      return await response.json();
    } catch (error) {
      console.error('Error fetching course:', error);
      return null;
    }
  };

  const createCourse = async (courseData) => {
    try {
      // TODO: Implement API call to create course
      const response = await fetch('/api/courses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(courseData),
      });
      const newCourse = await response.json();
      setCourses([...courses, newCourse]);
      return newCourse;
    } catch (error) {
      console.error('Error creating course:', error);
      throw error;
    }
  };

  const updateCourse = async (id, courseData) => {
    try {
      // TODO: Implement API call to update course
      const response = await fetch(`/api/courses/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(courseData),
      });
      const updatedCourse = await response.json();
      setCourses(courses.map(course => 
        course.id === id ? updatedCourse : course
      ));
      return updatedCourse;
    } catch (error) {
      console.error('Error updating course:', error);
      throw error;
    }
  };

  const deleteCourse = async (id) => {
    try {
      // TODO: Implement API call to delete course
      await fetch(`/api/courses/${id}`, {
        method: 'DELETE',
      });
      setCourses(courses.filter(course => course.id !== id));
    } catch (error) {
      console.error('Error deleting course:', error);
      throw error;
    }
  };

  const value = {
    courses,
    loading,
    getCourses,
    getCourseById,
    createCourse,
    updateCourse,
    deleteCourse,
  };

  return (
    <CourseContext.Provider value={value}>
      {children}
    </CourseContext.Provider>
  );
};

export const useCourse = () => {
  const context = useContext(CourseContext);
  if (context === undefined) {
    throw new Error('useCourse must be used within a CourseProvider');
  }
  return context;
};