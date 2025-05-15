import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import courseService from '../../services/courseService';
import { useAuth } from '../context/AuthContext';

const CourseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin, user } = useAuth();
  
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [enrolling, setEnrolling] = useState(false);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        setLoading(true);
        const response = await courseService.getCourseById(id);
        setCourse(response.data);
      } catch (error) {
        setError('Failed to fetch course details');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [id]);

  const handleEnroll = async () => {
    try {
      setEnrolling(true);
      await courseService.enrollCourse(id);
      // Refresh course data
      const response = await courseService.getCourseById(id);
      setCourse(response.data);
    } catch (error) {
      console.error('Failed to enroll:', error);
      alert(error.response?.data?.error || 'Failed to enroll in course');
    } finally {
      setEnrolling(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
      try {
        await courseService.deleteCourse(id);
        navigate('/courses');
      } catch (error) {
        console.error('Failed to delete course:', error);
        alert(error.response?.data?.error || 'Failed to delete course');
      }
    }
  };

  // Check if student is enrolled
  const isEnrolled = () => {
    return course?.enrolledStudents && course.enrolledStudents.includes(user.id);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="text-xl text-gray-600">Loading course details...</div>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4" role="alert">
          <p>{error || 'Course not found'}</p>
          <Link to="/courses" className="block mt-4 text-blue-600 hover:underline">
            Back to Courses
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6">
          <div className="flex justify-between items-start">
            <h1 className="text-3xl font-bold text-gray-800 mb-4">{course.title}</h1>
            <div className="space-x-2">
              <Link to="/courses" className="text-blue-600 hover:underline">
                Back to Courses
              </Link>
            </div>
          </div>

          <div className="mb-6 text-sm text-gray-500">
            <p>Created on {new Date(course.createdAt).toLocaleDateString()}</p>
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Course Information</h2>
            <div className="bg-gray-50 p-4 rounded">
              <p className="mb-2"><span className="font-semibold">Instructor:</span> {course.instructor}</p>
              <p className="mb-2"><span className="font-semibold">Duration:</span> {course.duration} hours</p>
              <p className="mb-2">
                <span className="font-semibold">Enrolled Students:</span> {course.enrolledStudents ? course.enrolledStudents.length : 0}
              </p>
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Description</h2>
            <p className="text-gray-700 whitespace-pre-line">{course.description}</p>
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Course Content</h2>
            <div className="bg-gray-50 p-4 rounded whitespace-pre-line">
              {course.content}
            </div>
          </div>

          <div className="mt-8 flex justify-between">
            {isAdmin() ? (
              <div className="space-x-4">
                <Link 
                  to={`/courses/edit/${course._id}`}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded"
                >
                  Edit Course
                </Link>
                <button 
                  onClick={handleDelete}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
                >
                  Delete Course
                </button>
              </div>
            ) : (
              <>
                {isEnrolled() ? (
                  <span className="inline-block bg-green-100 text-green-800 px-4 py-2 rounded">
                    You are enrolled in this course
                  </span>
                ) : (
                  <button
                    onClick={handleEnroll}
                    disabled={enrolling}
                    className={`bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded ${
                      enrolling ? 'opacity-75 cursor-not-allowed' : ''
                    }`}
                  >
                    {enrolling ? 'Enrolling...' : 'Enroll Now'}
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;