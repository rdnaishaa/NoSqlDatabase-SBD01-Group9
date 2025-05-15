import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import courseService from '../../services/courseService';
import CourseCard from './CourseCard';
import { useAuth } from '../context/AuthContext';

const CourseList = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user, isAdmin } = useAuth();

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const response = await courseService.getAllCourses();
        setCourses(response.data);
      } catch (error) {
        setError('Failed to fetch courses');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const handleEnroll = async (courseId) => {
    try {
      await courseService.enrollCourse(courseId);
      
      // Update the courses list to reflect enrollment
      const response = await courseService.getAllCourses();
      setCourses(response.data);
      
    } catch (error) {
      console.error('Failed to enroll:', error);
      alert(error.response?.data?.error || 'Failed to enroll in course');
    }
  };

  // Check if student is enrolled in a course
  const isEnrolled = (course) => {
    return course.enrolledStudents && course.enrolledStudents.includes(user.id);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="text-xl text-gray-600">Loading courses...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4" role="alert">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Available Courses</h1>
        {isAdmin() && (
          <Link 
            to="/courses/create" 
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          >
            Create New Course
          </Link>
        )}
      </div>

      {courses.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-xl text-gray-600">No courses available yet.</p>
          {isAdmin() && (
            <Link 
              to="/courses/create" 
              className="inline-block mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
            >
              Create Your First Course
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <CourseCard 
              key={course._id} 
              course={course} 
              onEnroll={handleEnroll}
              isEnrolled={isEnrolled(course)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CourseList;