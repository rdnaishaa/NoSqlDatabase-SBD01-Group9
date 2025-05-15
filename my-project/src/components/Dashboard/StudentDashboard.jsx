import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../components/context/AuthContext';

const StudentDashboard = () => {
  const { user } = useAuth();

  // Mock enrolled courses - replace with actual data from your backend
  const enrolledCourses = [
    {
      id: 1,
      title: 'Introduction to React',
      progress: 60,
      lastAccessed: '2024-01-20',
    },
    {
      id: 2,
      title: 'Advanced JavaScript',
      progress: 30,
      lastAccessed: '2024-01-19',
    },
  ];

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Welcome back, {user?.name || 'Student'}!</h1>
        <p className="text-gray-600">Track your progress and continue learning</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {enrolledCourses.map((course) => (
          <div key={course.id} className="border rounded-lg p-4 shadow hover:shadow-md transition-shadow">
            <h3 className="text-lg font-semibold mb-2">{course.title}</h3>
            <div className="mb-3">
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-blue-600 h-2.5 rounded-full" 
                  style={{ width: `${course.progress}%` }}
                ></div>
              </div>
              <span className="text-sm text-gray-600">{course.progress}% complete</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">
                Last accessed: {course.lastAccessed}
              </span>
              <Link
                to={`/courses/${course.id}`}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Continue
              </Link>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Available Courses</h2>
        <Link
          to="/courses"
          className="inline-block bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          Browse More Courses
        </Link>
      </div>
    </div>
  );
};

export default StudentDashboard;