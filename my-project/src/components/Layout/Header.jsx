import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Header = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-blue-600 text-white shadow-md">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold">E-Learning Platform</Link>
        
        <nav>
          <ul className="flex space-x-6">
            {user ? (
              <>
                <li>
                  <Link to="/courses" className="hover:text-blue-200">Courses</Link>
                </li>
                <li>
                  <Link to="/dashboard" className="hover:text-blue-200">Dashboard</Link>
                </li>
                {isAdmin() && (
                  <li>
                    <Link to="/courses/create" className="hover:text-blue-200">Create Course</Link>
                  </li>
                )}
                <li className="flex items-center">
                  <span className="mr-2">Welcome, {user.name}</span>
                  <button 
                    onClick={handleLogout}
                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                  >
                    Logout
                  </button>
                </li>
              </>
            ) : (
              <>
                <li>
                  <Link to="/login" className="hover:text-blue-200">Login</Link>
                </li>
                <li>
                  <Link to="/register" className="hover:text-blue-200">Register</Link>
                </li>
              </>
            )}
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;