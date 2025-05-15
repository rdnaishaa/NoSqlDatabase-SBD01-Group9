import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const CourseCard = ({ course, onEnroll, isEnrolled }) => {
  const { isAdmin, user } = useAuth();

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:shadow-lg hover:scale-105">
      <div className="p-6">
        <h2 className="text-xl font-bold mb-2 text-gray-800">{course.title}</h2>
        <p className="text-gray-600 mb-4">{course.description.length > 100 
          ? `${course.description.substring(0, 100)}...` 
          : course.description}
        </p>
        
        <div className="mb-4">
          <p><span className="font-semibold">Instructor:</span> {course.instructor}</p>
          <p><span className="font-semibold">Duration:</span> {course.duration} hours</p>
        </div>
        
        <div className="flex justify-between items-center mt-4">
          <Link 
            to={`/courses/${course._id}`}
            className="text-blue-600 hover:text-blue-800"
          >
            View Details
          </Link>
          
          <div>
            {isAdmin() ? (
              <div className="space-x-2">
                <Link 
                  to={`/courses/edit/${course._id}`} 
                  className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded text-sm"
                >
                  Edit
                </Link>
              </div>
            ) : (
              <>
                {isEnrolled ? (
                  <span className="bg-green-100 text-green-800 px-3 py-1 rounded text-sm">
                    Enrolled
                  </span>
                ) : (
                  <button
                    onClick={() => onEnroll(course._id)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
                  >
                    Enroll Now
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

export default CourseCard;