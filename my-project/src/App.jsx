import React, { useState, useEffect, createContext, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useNavigate, useParams } from "react-router-dom";
import { Link } from 'react-router-dom';
import './index.css'; 
import axios from 'axios';

// Set base URL for API
const API_URL = 'https://sbd-finpro-kuliah.vercel.app/api';

// Create Axios instance with authorization header
const authAxios = axios.create({
  baseURL: API_URL
});

// Add interceptor to add token to requests
authAxios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Authentication Context
const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUserLoggedIn = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const res = await authAxios.get('/auth/me');
          setCurrentUser(res.data.data);
        } catch (error) {
          localStorage.removeItem('token');
        }
      }
      setLoading(false);
    };

    checkUserLoggedIn();
  }, []);

  const login = async (email, password) => {
    const res = await axios.post(`${API_URL}/auth/login`, { email, password });
    localStorage.setItem('token', res.data.token);
    setCurrentUser(res.data.user);
    return res.data.user;
  };

  const register = async (userData) => {
    const res = await axios.post(`${API_URL}/auth/register`, userData);
    localStorage.setItem('token', res.data.token);
    setCurrentUser(res.data.user);
    return res.data.user;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider value={{ currentUser, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

// Auth required route wrapper
const PrivateRoute = ({ children }) => {
  const { currentUser, loading } = React.useContext(AuthContext);

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  return children;
};

// Admin required route wrapper
const AdminRoute = ({ children }) => {
  const { currentUser, loading } = React.useContext(AuthContext);

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  // Tambahkan pengecekan lebih aman dan tampilkan pesan jika bukan admin
  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  if (!currentUser.role || currentUser.role.toLowerCase() !== 'admin') {
    return (
      <div className="alert alert-danger" style={{ margin: 40 }}>
        Access denied. You are not authorized to access the admin panel.
      </div>
    );
  }

  return children;
};

// Components
const Navbar = () => {
  const { currentUser, logout } = React.useContext(AuthContext);
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="bg-gradient-to-r from-slate-900 via-blue-900 to-slate-800 shadow-xl border-b border-slate-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main navbar container - responsive grid */}
        <div className="grid grid-cols-2 lg:grid-cols-3 items-center py-4 gap-4">
          
          {/* Logo section - always visible */}
          <div className="flex items-center space-x-3 justify-self-start">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">E</span>
            </div>
            <Link 
              to="/" 
              className="text-lg sm:text-xl font-bold bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent hover:from-blue-200 hover:to-white transition-all duration-300"
            >
              <span className="hidden sm:inline">E-Course Platform</span>
              <span className="sm:hidden">E-Course</span>
            </Link>
          </div>

          {/* Desktop navigation - hidden on mobile */}
          <div className="hidden lg:flex items-center justify-center space-x-6">
            <Link 
              to="/courses"
              className="text-gray-300 hover:text-white hover:bg-slate-700/50 px-4 py-2 rounded-lg transition-all duration-300 font-medium"
            >
              Courses
            </Link>
            
            {currentUser && currentUser.role === 'admin' && (
              <Link 
                to="/admin"
                className="text-gray-300 hover:text-white hover:bg-slate-700/50 px-4 py-2 rounded-lg transition-all duration-300 font-medium flex items-center space-x-2"
              >
                <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                <span>Admin Panel</span>
              </Link>
            )}
          </div>

          {/* Right section - auth buttons/user info and mobile menu button */}
          <div className="flex items-center justify-self-end space-x-2">
            {/* Desktop auth section */}
            <div className="hidden lg:flex items-center space-x-4">
              {currentUser ? (
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2 bg-slate-800/50 px-3 py-2 rounded-lg border border-slate-600">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-medium">{currentUser.name.charAt(0)}</span>
                    </div>
                    <span className="text-gray-300 text-sm hidden xl:block">
                      Welcome, <span className="text-white font-medium">{currentUser.name}</span>
                    </span>
                  </div>
                  <button 
                    onClick={logout} 
                    className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-4 py-2 rounded-lg font-medium transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <Link 
                    to="/login" 
                    className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-2 rounded-lg font-medium transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    Login
                  </Link>
                  <Link 
                    to="/register" 
                    className="bg-slate-600 hover:bg-slate-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-300 border border-slate-500 hover:border-slate-400 shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile user avatar or login button */}
            <div className="flex lg:hidden items-center space-x-2">
              {currentUser ? (
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">{currentUser.name.charAt(0)}</span>
                </div>
              ) : (
                <Link 
                  to="/login" 
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-3 py-2 rounded-lg font-medium transition-all duration-300 text-sm"
                >
                  Login
                </Link>
              )}
            </div>

            {/* Mobile menu button */}
            <button 
              onClick={toggleMenu}
              className="lg:hidden p-2 rounded-lg text-gray-300 hover:text-white hover:bg-slate-700/50 transition-all duration-300"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu - collapsible */}
        <div className={`lg:hidden transition-all duration-300 ease-in-out ${isMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
          <div className="pb-4 space-y-2">
            <div className="grid gap-2">
              <Link 
                to="/courses"
                onClick={() => setIsMenuOpen(false)}
                className="text-gray-300 hover:text-white hover:bg-slate-700/50 px-4 py-3 rounded-lg transition-all duration-300 font-medium block"
              >
                Courses
              </Link>
              
              {currentUser && currentUser.role === 'admin' && (
                <Link 
                  to="/admin"
                  onClick={() => setIsMenuOpen(false)}
                  className="text-gray-300 hover:text-white hover:bg-slate-700/50 px-4 py-3 rounded-lg transition-all duration-300 font-medium flex items-center space-x-2"
                >
                  <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                  <span>Admin Panel</span>
                </Link>
              )}

              {/* Mobile auth section */}
              {currentUser ? (
                <div className="space-y-2 pt-2 border-t border-slate-700">
                  <div className="flex items-center space-x-3 px-4 py-2 bg-slate-800/50 rounded-lg border border-slate-600">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-medium">{currentUser.name.charAt(0)}</span>
                    </div>
                    <span className="text-gray-300 text-sm">
                      Welcome, <span className="text-white font-medium">{currentUser.name}</span>
                    </span>
                  </div>
                  <button 
                    onClick={() => {
                      logout();
                      setIsMenuOpen(false);
                    }}
                    className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-4 py-3 rounded-lg font-medium transition-all duration-300"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-slate-700">
                  <Link 
                    to="/login"
                    onClick={() => setIsMenuOpen(false)}
                    className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-3 rounded-lg font-medium transition-all duration-300 text-center"
                  >
                    Login
                  </Link>
                  <Link 
                    to="/register"
                    onClick={() => setIsMenuOpen(false)}
                    className="bg-slate-600 hover:bg-slate-700 text-white px-4 py-3 rounded-lg font-medium transition-all duration-300 border border-slate-500 hover:border-slate-400 text-center"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

const Home = () => {
  const { currentUser } = useAuth();
  const [allCourses, setAllCourses] = useState([]);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [progresses, setProgresses] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchEnrolled = async () => {
      if (!currentUser) return;
      try {
        // Ambil semua courses
        const allRes = await authAxios.get('/courses');
        setAllCourses(allRes.data.data);
        // Coba endpoint /users/:id, jika gagal fallback ke /auth/me
        let res;
        try {
          res = await authAxios.get(`/users/${currentUser._id || currentUser.id}`);
        } catch (err) {
          res = await authAxios.get('/auth/me');
        }
        const userData = res.data.data || {};
        const enrolledIds = (userData.enrolledCourses || []).map(c => c._id || c);
        // Filter allCourses yang di-enroll
        const enrolled = allRes.data.data.filter(c => enrolledIds.includes(c._id));
        setEnrolledCourses(enrolled);
        // Ambil progress untuk setiap course
        const progressesObj = {};
        for (let course of enrolled) {
          try {
            const progRes = await authAxios.get(`/courses/progress/${course._id}`);
            progressesObj[course._id] = progRes.data.data;
          } catch (err) {
            progressesObj[course._id] = null;
          }
        }
        setProgresses(progressesObj);
        setError('');
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to load enrolled courses');
        setEnrolledCourses([]);
      } finally {
        setLoading(false);
      }
    };
    fetchEnrolled();
  }, [currentUser]);

  // Unenroll handler
  const unenrollCourse = async (courseId) => {
    if (!window.confirm('Are you sure you want to unenroll from this course?')) return;
    try {
      await authAxios.post(`/courses/${courseId}/unenroll`);
      setEnrolledCourses(enrolledCourses.filter(c => c._id !== courseId));
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to unenroll');
    }
  };

  // Landing page for non-authenticated users
  if (!currentUser) return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="flex flex-col items-center justify-center min-h-screen py-12 sm:py-16 lg:py-20">
          <div className="text-center max-w-4xl mx-auto">
            {/* Logo and Title */}
            <div className="flex flex-col items-center mb-8 sm:mb-12">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl mb-6 sm:mb-8 flex items-center justify-center shadow-xl">
                <span className="text-white text-2xl sm:text-3xl font-bold">E</span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold bg-gradient-to-r from-slate-800 to-blue-600 bg-clip-text text-transparent mb-4 sm:mb-6 leading-tight">
                Welcome to E-Course Platform
              </h1>
              <p className="text-lg sm:text-xl lg:text-2xl text-slate-600 mb-8 sm:mb-12 leading-relaxed max-w-3xl">
                Learn new skills with our comprehensive online courses
              </p>
            </div>

            {/* CTA Button */}
            <div className="flex justify-center">
              <Link 
                to="/courses" 
                className="inline-flex items-center px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 text-base sm:text-lg"
              >
                Browse Courses
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Dashboard for authenticated users
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header Section */}
        <div className="mb-8 sm:mb-12">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl shadow-lg p-6 sm:p-8 border border-blue-100">
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center flex-shrink-0">
                <span className="text-white text-lg sm:text-2xl font-bold">{currentUser.name.charAt(0)}</span>
              </div>
              <div className="flex-1">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-slate-800 to-blue-600 bg-clip-text text-transparent mb-2">
                  Welcome, {currentUser.name}
                </h1>
                <p className="text-slate-600 text-base sm:text-lg">Here are your enrolled courses</p>
              </div>
            </div>
          </div>
        </div>

        {/* Content Section */}
        {loading ? (
          <div className="flex items-center justify-center py-16 sm:py-20">
            <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 border border-slate-200">
              <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4">
                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-slate-600 text-base sm:text-lg text-center sm:text-left">Loading your courses...</span>
              </div>
            </div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 sm:p-6 shadow-lg">
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-3">
              <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white text-sm font-bold">!</span>
              </div>
              <span className="text-red-700 font-medium text-sm sm:text-base">{error}</span>
            </div>
          </div>
        ) : enrolledCourses.length === 0 ? (
          <div className="flex items-center justify-center py-16 sm:py-20">
            <div className="bg-white rounded-2xl shadow-xl p-8 sm:p-12 border border-slate-200 max-w-sm sm:max-w-md mx-auto text-center">
              <div className="w-16 h-16 bg-slate-100 rounded-full mx-auto mb-6 flex items-center justify-center">
                <span className="text-slate-400 text-2xl">📚</span>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-slate-800 mb-2">No Courses Yet</h3>
              <p className="text-slate-600 text-sm sm:text-base">You have not enrolled in any courses yet.</p>
              <Link 
                to="/courses"
                className="inline-flex items-center mt-6 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-300"
              >
                Browse Courses
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {enrolledCourses.map(course => {
              const prog = progresses[course._id];
              const isCompleted = prog && prog.isCompleted;
              return (
                <div key={course._id} className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-200 overflow-hidden group h-full flex flex-col">
                  <div className="p-4 sm:p-6 flex flex-col h-full">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="text-lg sm:text-xl font-bold text-slate-800 group-hover:text-blue-600 transition-colors duration-300 line-clamp-2 flex-1 mr-2">
                        {course.title}
                      </h3>
                      {isCompleted && (
                        <div className="bg-green-100 text-green-700 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium flex-shrink-0">
                          ✓ Completed
                        </div>
                      )}
                    </div>
                    
                    {/* Description */}
                    <p className="text-slate-600 mb-4 text-sm sm:text-base line-clamp-3 flex-1">{course.description}</p>
                    
                    {/* Course Info */}
                    <div className="space-y-2 mb-6">
                      <div className="flex items-center text-xs sm:text-sm text-slate-500">
                        <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span className="truncate">Instructor: {course.instructor}</span>
                      </div>
                      <div className="flex items-center text-xs sm:text-sm text-slate-500">
                        <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Duration: {course.duration} hours
                      </div>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-auto">
                      <Link 
                        to={`/courses/${course._id}`} 
                        className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2.5 rounded-lg font-medium hover:from-blue-700 hover:to-blue-800 transition-all duration-300 text-center text-sm sm:text-base"
                      >
                        View Details
                      </Link>
                      {currentUser.role === 'student' && (
                        <button 
                          onClick={() => unenrollCourse(course._id)} 
                          className="px-4 py-2.5 bg-slate-100 text-slate-600 rounded-lg font-medium hover:bg-red-50 hover:text-red-600 transition-all duration-300 border border-slate-200 text-sm sm:text-base"
                        >
                          Unenroll
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Quick Stats Section - Only show if user has courses */}
        {enrolledCourses.length > 0 && (
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-4 sm:p-6 border border-blue-200">
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-blue-600 mb-1">{enrolledCourses.length}</div>
                <div className="text-sm sm:text-base text-blue-700">Total Courses</div>
              </div>
            </div>
            <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-4 sm:p-6 border border-green-200">
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-green-600 mb-1">
                  {Object.values(progresses).filter(p => p && p.isCompleted).length}
                </div>
                <div className="text-sm sm:text-base text-green-700">Completed</div>
              </div>
            </div>
            <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl p-4 sm:p-6 border border-orange-200">
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-orange-600 mb-1">
                  {enrolledCourses.length - Object.values(progresses).filter(p => p && p.isCompleted).length}
                </div>
                <div className="text-sm sm:text-base text-orange-700">In Progress</div>
              </div>
            </div>
            <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-4 sm:p-6 border border-purple-200">
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-purple-600 mb-1">
                  {enrolledCourses.reduce((total, course) => total + parseInt(course.duration || 0), 0)}h
                </div>
                <div className="text-sm sm:text-base text-purple-700">Total Hours</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Login Page
const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = React.useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen bg-white flex">
      {/* Left side - Hidden on mobile, visible on md+ */}
      <div className="hidden md:flex md:w-1/2 lg:w-3/5 bg-gradient-to-br from-blue-50 to-blue-100 items-center justify-center p-8">
        <div className="max-w-md text-center">
          <div className="w-24 h-24 lg:w-32 lg:h-32 bg-gradient-to-br from-blue-500 to-blue-700 rounded-3xl mx-auto mb-6 flex items-center justify-center">
            <svg className="w-12 h-12 lg:w-16 lg:h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-800 mb-4">
            Start Your Learning Journey
          </h1>
          <p className="text-slate-600 text-lg">
            Access thousands of courses and expand your knowledge with our comprehensive learning platform.
          </p>
        </div>
      </div>

      {/* Right side - Login form */}
      <div className="flex-1 md:w-1/2 lg:w-2/5 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-md">
          {/* Mobile logo - Only visible on small screens */}
          <div className="md:hidden text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl mx-auto mb-4 flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
          </div>

          {/* Header */}
          <div className="mb-6 lg:mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-2">
              Welcome Back
            </h2>
            <p className="text-slate-600 text-sm sm:text-base">
              Sign in to continue your learning journey
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 sm:p-4 mb-4 sm:mb-6">
              <div className="flex items-start space-x-3">
                <div className="w-5 h-5 sm:w-6 sm:h-6 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-xs font-bold">!</span>
                </div>
                <span className="text-red-700 font-medium text-sm sm:text-base">{error}</span>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            <div className="grid gap-1 sm:gap-2">
              <label className="text-sm font-semibold text-slate-700">
                Email Address
              </label>
              <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 bg-gray-50 focus:bg-white text-sm sm:text-base"
                placeholder="Enter your email"
              />
            </div>
            
            <div className="grid gap-1 sm:gap-2">
              <label className="text-sm font-semibold text-slate-700">
                Password
              </label>
              <input 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 bg-gray-50 focus:bg-white text-sm sm:text-base"
                placeholder="Enter your password"
              />
            </div>
            
            <button 
              type="submit" 
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-2.5 sm:py-3 px-4 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl text-sm sm:text-base"
            >
              Sign In
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center my-6 sm:my-8">
            <div className="flex-1 border-t border-slate-200"></div>
            <span className="px-4 text-sm text-slate-500">or</span>
            <div className="flex-1 border-t border-slate-200"></div>
          </div>

          {/* Footer */}
          <div className="text-center">
            <p className="text-slate-600 text-sm sm:text-base">
              Don't have an account? {' '}
              <Link 
                to="/register" 
                className="text-blue-600 hover:text-blue-700 font-semibold hover:underline transition-colors duration-300"
              >
                Create Account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Register Page
const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student'
  });
  const [error, setError] = useState('');
  const { register } = React.useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await register(formData);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen bg-white flex">
      {/* Left side - Hidden on mobile, visible on md+ */}
      <div className="hidden md:flex md:w-1/2 lg:w-3/5 bg-gradient-to-br from-blue-50 to-blue-100 items-center justify-center p-8">
        <div className="max-w-md text-center">
          <div className="w-24 h-24 lg:w-32 lg:h-32 bg-gradient-to-br from-blue-500 to-blue-700 rounded-3xl mx-auto mb-6 flex items-center justify-center">
            <svg className="w-12 h-12 lg:w-16 lg:h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-800 mb-4">
            Join Our Community
          </h1>
          <p className="text-slate-600 text-lg">
            Create your account today and unlock access to premium learning resources and personalized courses.
          </p>
        </div>
      </div>

      {/* Right side - Register form */}
      <div className="flex-1 md:w-1/2 lg:w-2/5 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-md">
          {/* Mobile logo - Only visible on small screens */}
          <div className="md:hidden text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl mx-auto mb-4 flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </div>
          </div>

          {/* Header */}
          <div className="mb-6 lg:mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-2">
              Join Us Today
            </h2>
            <p className="text-slate-600 text-sm sm:text-base">
              Create your account to start learning
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 sm:p-4 mb-4 sm:mb-6">
              <div className="flex items-start space-x-3">
                <div className="w-5 h-5 sm:w-6 sm:h-6 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-xs font-bold">!</span>
                </div>
                <span className="text-red-700 font-medium text-sm sm:text-base">{error}</span>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
            {/* Name and Email - Grid layout on larger screens */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
              <div className="grid gap-1 sm:gap-2">
                <label className="text-sm font-semibold text-slate-700">
                  Full Name
                </label>
                <input 
                  type="text" 
                  name="name" 
                  value={formData.name} 
                  onChange={handleChange} 
                  required 
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 bg-gray-50 focus:bg-white text-sm sm:text-base"
                  placeholder="Enter your full name"
                />
              </div>
              
              <div className="grid gap-1 sm:gap-2 lg:col-span-1">
                <label className="text-sm font-semibold text-slate-700">
                  Email Address
                </label>
                <input 
                  type="email" 
                  name="email" 
                  value={formData.email} 
                  onChange={handleChange} 
                  required 
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 bg-gray-50 focus:bg-white text-sm sm:text-base"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            {/* Password and Role - Grid layout on larger screens */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
              <div className="grid gap-1 sm:gap-2">
                <label className="text-sm font-semibold text-slate-700">
                  Password
                </label>
                <input 
                  type="password" 
                  name="password" 
                  value={formData.password} 
                  onChange={handleChange} 
                  required 
                  minLength="6"
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 bg-gray-50 focus:bg-white text-sm sm:text-base"
                  placeholder="Min. 6 characters"
                />
              </div>
              
              <div className="grid gap-1 sm:gap-2">
                <label className="text-sm font-semibold text-slate-700">
                  Account Type
                </label>
                <div className="relative">
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    required
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 bg-gray-50 focus:bg-white appearance-none cursor-pointer text-sm sm:text-base"
                  >
                    <option value="student">Student Account</option>
                    <option value="admin">Admin Account</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
            
            <button 
              type="submit" 
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-2.5 sm:py-3 px-4 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl text-sm sm:text-base mt-6"
            >
              Create Account
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center my-6 sm:my-8">
            <div className="flex-1 border-t border-slate-200"></div>
            <span className="px-4 text-sm text-slate-500">or</span>
            <div className="flex-1 border-t border-slate-200"></div>
          </div>

          {/* Footer */}
          <div className="text-center">
            <p className="text-slate-600 text-sm sm:text-base">
              Already have an account? {' '}
              <Link 
                to="/login" 
                className="text-blue-600 hover:text-blue-700 font-semibold hover:underline transition-colors duration-300"
              >
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Courses List Page
const CoursesList = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { currentUser } = React.useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await authAxios.get('/courses');
        setCourses(res.data.data);
      } catch (err) {
        setError('Failed to load courses');
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const enrollCourse = async (courseId) => {
    try {
      await authAxios.post(`/users/enroll/${courseId}`);
      setCourses(prevCourses =>
        prevCourses.map(course =>
          course._id === courseId
            ? {
                ...course,
                enrolledStudents: [
                  ...new Set([
                    ...(course.enrolledStudents || []),
                    currentUser?.id || currentUser?._id
                  ])
                ]
              }
            : course
        )
      );
    } catch (err) {
      if (err.response && err.response.status === 404) {
        try {
          await authAxios.post(`/courses/${courseId}/enroll`);
          setCourses(prevCourses =>
            prevCourses.map(course =>
              course._id === courseId
                ? {
                    ...course,
                    enrolledStudents: [
                      ...new Set([
                        ...(course.enrolledStudents || []),
                        currentUser?.id || currentUser?._id
                      ])
                    ]
                  }
                : course
            )
          );
          return;
        } catch (err2) {
          setError(err2.response?.data?.error || 'Failed to enroll');
          return;
        }
      }
      setError(err.response?.data?.error || 'Failed to enroll');
    }
  };

  const unenrollCourse = async (courseId) => {
    if (!window.confirm('Are you sure you want to unenroll from this course?')) return;
    try {
      await authAxios.post(`/courses/${courseId}/unenroll`);
      setCourses(prevCourses => prevCourses.map(course =>
        course._id === courseId
          ? {
              ...course,
              enrolledStudents: course.enrolledStudents.filter(id => id !== (currentUser?.id || currentUser?._id))
            }
          : course
      ));
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to unenroll');
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 border border-gray-200 max-w-sm w-full">
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin flex-shrink-0"></div>
          <span className="text-gray-600 text-base sm:text-lg text-center sm:text-left">Loading courses...</span>
        </div>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 sm:p-8 shadow-lg max-w-md w-full">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-white text-sm font-bold">!</span>
          </div>
          <span className="text-red-700 font-medium text-center sm:text-left">{error}</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
        {/* Header Section */}
        <div className="mb-8 sm:mb-12">
          <div className="text-center max-w-4xl mx-auto">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl sm:rounded-2xl mx-auto mb-4 sm:mb-6 flex items-center justify-center">
              <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-gray-800 to-blue-600 bg-clip-text text-transparent mb-3 sm:mb-4">
              Available Courses
            </h2>
            <p className="text-gray-600 text-base sm:text-lg px-4">
              Discover and enroll in courses that match your learning goals
            </p>
          </div>
        </div>

        {/* Courses Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
          {courses.map(course => {
            const userId = currentUser?.id || currentUser?._id;
            const enrolledStudents = Array.isArray(course.enrolledStudents) ? course.enrolledStudents : [];
            const isEnrolled = enrolledStudents.includes(userId);
            return (
              <div key={course._id} className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-200 overflow-hidden group flex flex-col">
                {/* Course Header */}
                <div className="p-4 sm:p-6 flex-grow flex flex-col">
                  <div className="flex items-start justify-between mb-3 sm:mb-4 gap-2">
                    <h3 className="text-lg sm:text-xl font-bold text-gray-800 group-hover:text-blue-600 transition-colors duration-300 line-clamp-2 flex-grow">
                      {course.title}
                    </h3>
                    {isEnrolled && (
                      <div className="bg-green-100 text-green-700 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium flex items-center gap-1 flex-shrink-0">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span className="hidden sm:inline">Enrolled</span>
                      </div>
                    )}
                  </div>
                  
                  <p className="text-gray-600 mb-4 sm:mb-6 line-clamp-3 text-sm sm:text-base flex-grow">{course.description}</p>
                  
                  {/* Course Details */}
                  <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
                    <div className="flex items-center text-xs sm:text-sm text-gray-500">
                      <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-2 sm:mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span className="font-medium mr-1">Instructor:</span>
                      <span className="truncate">{course.instructor}</span>
                    </div>
                    <div className="flex items-center text-xs sm:text-sm text-gray-500">
                      <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-2 sm:mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="font-medium mr-1">Duration:</span>
                      <span>{course.duration} hours</span>
                    </div>
                  </div>
                </div>

                {/* Course Actions */}
                <div className="px-4 sm:px-6 py-3 sm:py-4 bg-gray-50 border-t border-gray-100 flex-shrink-0">
                  <div className="flex flex-col gap-2">
                    {/* View Details Button */}
                    <Link 
                      to={isEnrolled ? `/courses/${course._id}` : '#'}
                      className={`w-full text-center px-3 sm:px-4 py-2 rounded-lg font-medium transition-all duration-300 text-sm sm:text-base ${
                        isEnrolled 
                          ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 transform hover:scale-105' 
                          : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      }`}
                      tabIndex={isEnrolled ? 0 : -1}
                      aria-disabled={!isEnrolled}
                      onClick={e => {
                        if (!isEnrolled) {
                          e.preventDefault();
                          alert('You must enroll in this course before you can view the details.');
                        }
                      }}
                    >
                      View Details
                    </Link>

                    {/* Student Actions */}
                    {currentUser && currentUser.role === 'student' && (
                      <div className="flex gap-2">
                        <button 
                          onClick={() => enrollCourse(course._id)} 
                          disabled={isEnrolled}
                          className={`flex-1 px-3 sm:px-4 py-2 rounded-lg font-medium transition-all duration-300 text-sm sm:text-base ${
                            isEnrolled 
                              ? 'bg-green-100 text-green-700 cursor-default' 
                              : 'bg-gray-600 hover:bg-gray-700 text-white transform hover:scale-105'
                          }`}
                        >
                          {isEnrolled ? 'Enrolled' : 'Enroll'}
                        </button>
                        {isEnrolled && (
                          <button 
                            onClick={() => unenrollCourse(course._id)} 
                            className="flex-1 px-3 sm:px-4 py-2 bg-red-100 text-red-600 rounded-lg font-medium hover:bg-red-200 transition-all duration-300 text-sm sm:text-base"
                          >
                            Unenroll
                          </button>
                        )}
                      </div>
                    )}

                    {/* Admin Actions */}
                    {currentUser && currentUser.role === 'admin' && (
                      <div className="flex gap-2">
                        <button
                          className="flex-1 px-3 sm:px-4 py-2 bg-yellow-100 text-yellow-700 rounded-lg font-medium hover:bg-yellow-200 transition-all duration-300 text-sm sm:text-base"
                          onClick={() => navigate(`/admin/courses/edit/${course._id}`)}
                        >
                          Edit
                        </button>
                        <button
                          className="flex-1 px-3 sm:px-4 py-2 bg-red-100 text-red-600 rounded-lg font-medium hover:bg-red-200 transition-all duration-300 text-sm sm:text-base"
                          onClick={() => deleteCourse(course._id)}
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {courses.length === 0 && !loading && !error && (
          <div className="text-center py-12 sm:py-20">
            <div className="bg-white rounded-xl shadow-lg p-8 sm:p-12 border border-gray-200 max-w-md mx-auto">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-full mx-auto mb-4 sm:mb-6 flex items-center justify-center">
                <svg className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2">No Courses Available</h3>
              <p className="text-gray-600 text-sm sm:text-base">Check back later for new courses.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Course Detail Page - Responsive Version
const CourseDetail = () => {
  const [course, setCourse] = useState(null);
  const [progress, setProgress] = useState(null); // progress user
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { id } = useParams();
  const { currentUser } = useAuth();
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isEnrolled, setIsEnrolled] = useState(false);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const res = await authAxios.get(`/courses/${id}`);
        setCourse(res.data.data);
        // Gunakan totalPages dari course.pages jika ada
        let courseTotalPages = (res.data.data.pages && res.data.data.pages.length) || res.data.data.totalPages || 1;
        setTotalPages(courseTotalPages);
        if (currentUser) {
          // Cek enrolled
          let enrolled = false;
          if (Array.isArray(res.data.data.enrolledStudents)) {
            enrolled = res.data.data.enrolledStudents.includes(currentUser._id || currentUser.id);
          }
          setIsEnrolled(enrolled);
          if (enrolled) {
            try {
              const progRes = await authAxios.get(`/courses/progress/${id}`);
              setProgress(progRes.data.data);
              setCurrentPage(
                progRes.data.data.currentPage && progRes.data.data.currentPage > 0
                  ? progRes.data.data.currentPage
                  : 1
              );
              setTotalPages(
                (res.data.data.pages && res.data.data.pages.length) ||
                (progRes.data.data.totalPages && progRes.data.data.totalPages > 0
                  ? progRes.data.data.totalPages
                  : courseTotalPages)
              );
            } catch (err) {
              setCurrentPage(1);
              setTotalPages(courseTotalPages);
            }
          }
        }
      } catch (err) {
        setError('Failed to load course details');
      } finally {
        setLoading(false);
      }
    };
    fetchCourse();
    // eslint-disable-next-line
  }, [id, currentUser]);

  // Update page progress ke backend
  const updatePageProgress = async (page) => {
    try {
      const res = await authAxios.post(`/courses/progress/${id}/page`, {
        page,
        totalPages: totalPages || 20
      });
      setProgress(res.data.data);
      setCurrentPage(res.data.data.currentPage || page);
    } catch (err) {
      setError('Failed to update page progress');
    }
  };

  // Simulasi belajar 1 jam
  const handleLearnOneHour = async () => {
    try {
      const res = await authAxios.post(`/courses/progress/${id}/add-hour`);
      setProgress(res.data.data);
    } catch (err) {
      setError('Failed to update progress');
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      const newPage = currentPage - 1;
      setCurrentPage(newPage);
      updatePageProgress(newPage);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      const newPage = currentPage + 1;
      setCurrentPage(newPage);
      updatePageProgress(newPage);
    } else if (currentPage === totalPages) {
      // Jika sudah di akhir, restart ke awal
      setCurrentPage(1);
      updatePageProgress(1);
    }
  };

  // Render konten per halaman - diperbaiki agar tidak terpotong
  const renderPageContent = () => {
    if (!course) return 'No content';
    
    // Jika ada pages array, gunakan langsung
    if (Array.isArray(course.pages) && course.pages.length > 0) {
      return course.pages[currentPage - 1] || 'No content';
    }
    
    // Jika content adalah string dan perlu dipaginasi
    if (course.content && typeof course.content === 'string') {
      // Tampilkan full content tanpa dipotong jika hanya 1 halaman
      if (totalPages === 1) {
        return course.content;
      }
      
      // Jika ada beberapa halaman, bagi berdasarkan paragraf atau kalimat
      const sentences = course.content.split(/[.!?]+/).filter(s => s.trim().length > 0);
      const sentencesPerPage = Math.ceil(sentences.length / totalPages);
      const startIndex = (currentPage - 1) * sentencesPerPage;
      const endIndex = Math.min(startIndex + sentencesPerPage, sentences.length);
      
      return sentences.slice(startIndex, endIndex).join('. ') + (endIndex < sentences.length ? '.' : '');
    }
    
    return 'No content';
  };

  // Progress bar presentase
  const progressPercent = Math.round((currentPage / (totalPages || 20)) * 100);

  if (loading) return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      padding: '1rem',
      background: '#ffffff'
    }}>
      <div style={{
        padding: '2rem',
        background: '#ffffff',
        borderRadius: '12px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        border: '1px solid #e5e7eb',
        textAlign: 'center',
        fontSize: '1.125rem',
        color: '#2563eb',
        maxWidth: '90%',
        width: '100%',
        maxWidth: '400px'
      }}>
        Loading course details...
      </div>
    </div>
  );

  if (error) return (
    <div style={{
      padding: '1rem',
      background: '#ffffff',
      minHeight: '100vh'
    }}>
      <div style={{
        margin: '2rem auto',
        padding: '1.5rem',
        background: '#fef2f2',
        color: '#dc2626',
        borderRadius: '12px',
        border: '1px solid #fecaca',
        boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
        maxWidth: '600px',
        textAlign: 'center'
      }}>
        {error}
      </div>
    </div>
  );

  if (!course) return (
    <div style={{
      padding: '1rem',
      background: '#ffffff',
      minHeight: '100vh'
    }}>
      <div style={{
        textAlign: 'center',
        margin: '2rem auto',
        padding: '2rem',
        background: '#ffffff',
        borderRadius: '12px',
        color: '#1f2937',
        border: '1px solid #e5e7eb',
        boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
        maxWidth: '600px'
      }}>
        Course not found
      </div>
    </div>
  );

  if (!isEnrolled && currentUser && currentUser.role === 'student') {
    return (
      <div style={{
        padding: '1rem',
        background: '#ffffff',
        minHeight: '100vh'
      }}>
        <div style={{
          margin: '2rem auto',
          padding: '2rem',
          background: '#fffbeb',
          color: '#92400e',
          borderRadius: '12px',
          border: '1px solid #fde68a',
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
          textAlign: 'center',
          fontSize: '1rem',
          maxWidth: '600px'
        }}>
          You are not enrolled in this course.
        </div>
      </div>
    );
  }

  return (
    <div style={{
      background: '#ffffff',
      minHeight: '100vh',
      padding: '1rem'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        background: '#ffffff',
        borderRadius: '16px',
        boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
        border: '1px solid #e5e7eb',
        overflow: 'hidden'
      }}>
        
        {/* Header Section */}
        <div style={{
          background: 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)',
          color: '#ffffff',
          padding: '2rem 1.5rem',
          textAlign: 'center'
        }}>
          <h1 style={{
            margin: '0 0 2rem 0',
            fontSize: 'clamp(1.5rem, 4vw, 2.5rem)',
            fontWeight: '700',
            lineHeight: '1.2',
            letterSpacing: '-0.025em'
          }}>
            {course.title}
          </h1>
          
          {/* Course Info Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem',
            marginTop: '1.5rem'
          }}>
            <div style={{
              background: 'rgba(255,255,255,0.15)',
              padding: '1rem',
              borderRadius: '8px',
              borderLeft: '4px solid #60a5fa',
              textAlign: 'left'
            }}>
              <div style={{ 
                fontSize: '0.875rem', 
                opacity: '0.9', 
                marginBottom: '0.5rem',
                fontWeight: '500'
              }}>
                Instructor
              </div>
              <div style={{ 
                fontSize: '1rem', 
                fontWeight: '600',
                wordBreak: 'break-word'
              }}>
                {course.instructor}
              </div>
            </div>
            
            <div style={{
              background: 'rgba(255,255,255,0.15)',
              padding: '1rem',
              borderRadius: '8px',
              borderLeft: '4px solid #60a5fa',
              textAlign: 'left'
            }}>
              <div style={{ 
                fontSize: '0.875rem', 
                opacity: '0.9', 
                marginBottom: '0.5rem',
                fontWeight: '500'
              }}>
                Duration
              </div>
              <div style={{ 
                fontSize: '1rem', 
                fontWeight: '600'
              }}>
                {course.duration} hours
              </div>
            </div>
            
            <div style={{
              background: 'rgba(255,255,255,0.15)',
              padding: '1rem',
              borderRadius: '8px',
              borderLeft: '4px solid #60a5fa',
              textAlign: 'left'
            }}>
              <div style={{ 
                fontSize: '0.875rem', 
                opacity: '0.9', 
                marginBottom: '0.5rem',
                fontWeight: '500'
              }}>
                Created
              </div>
              <div style={{ 
                fontSize: '1rem', 
                fontWeight: '600'
              }}>
                {new Date(course.createdAt).toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div style={{ 
          padding: '1.5rem',
          background: '#ffffff'
        }}>
          
          {/* Description */}
          <div style={{
            background: '#f8fafc',
            padding: '1.5rem',
            borderRadius: '12px',
            marginBottom: '1.5rem',
            border: '1px solid #e2e8f0'
          }}>
            <h2 style={{
              color: '#2563eb',
              marginBottom: '1rem',
              fontSize: 'clamp(1.25rem, 3vw, 1.5rem)',
              fontWeight: '600',
              borderBottom: '2px solid #2563eb',
              paddingBottom: '0.5rem',
              display: 'inline-block'
            }}>
              Course Description
            </h2>
            <p style={{
              color: '#374151',
              lineHeight: '1.6',
              fontSize: '1rem',
              margin: '0',
              wordBreak: 'break-word'
            }}>
              {course.description}
            </p>
          </div>

          {/* Course Content */}
          <div style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            overflow: 'hidden',
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
            marginBottom: '1.5rem'
          }}>
            
            {/* Content Header */}
            <div style={{
              background: 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)',
              color: '#ffffff',
              padding: '1rem 1.5rem',
              fontSize: 'clamp(1.125rem, 2.5vw, 1.25rem)',
              fontWeight: '600'
            }}>
              Course Content
            </div>
            
            {/* Content Body */}
            <div style={{
              padding: '1.5rem',
              background: '#f8fafc'
            }}>
              <div style={{
                background: '#ffffff',
                padding: '1.5rem',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                lineHeight: '1.7',
                fontSize: '1rem',
                color: '#1f2937',
                minHeight: '200px',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                overflowWrap: 'break-word'
              }}>
                {renderPageContent()}
              </div>
            </div>
            
            {/* Navigation Controls */}
            <div style={{
              background: '#f1f5f9',
              padding: '1rem 1.5rem',
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '1rem',
              borderTop: '1px solid #e2e8f0'
            }}>
              <button 
                onClick={handlePrevPage} 
                disabled={currentPage === 1}
                style={{
                  background: currentPage === 1 ? '#9ca3af' : 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)',
                  color: '#ffffff',
                  border: 'none',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '8px',
                  cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  transition: 'all 0.2s ease',
                  minWidth: '80px',
                  flexShrink: 0
                }}
              >
                Previous
              </button>
              
              <div style={{
                background: '#2563eb',
                color: '#ffffff',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                fontWeight: '500',
                fontSize: '0.875rem',
                textAlign: 'center',
                flexShrink: 0,
                whiteSpace: 'nowrap'
              }}>
                Page {currentPage} of {totalPages}
              </div>
              
              <button 
                onClick={handleNextPage}
                style={{
                  background: 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)',
                  color: '#ffffff',
                  border: 'none',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  transition: 'all 0.2s ease',
                  minWidth: '80px',
                  flexShrink: 0
                }}
              >
                {currentPage === totalPages ? 'Restart' : 'Next'}
              </button>
            </div>
          </div>

          {/* Progress Section */}
          <div style={{
            background: '#f8fafc',
            padding: '1.5rem',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            marginBottom: '1.5rem'
          }}>
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1rem',
              gap: '1rem'
            }}>
              <h3 style={{
                color: '#2563eb',
                fontWeight: '600',
                fontSize: 'clamp(1.125rem, 2.5vw, 1.25rem)',
                margin: '0',
                borderBottom: '2px solid #2563eb',
                paddingBottom: '0.25rem',
                display: 'inline-block'
              }}>
                Learning Progress
              </h3>
              <span style={{
                background: progressPercent === 100 ? '#10b981' : '#2563eb',
                color: '#ffffff',
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                fontSize: '0.875rem',
                fontWeight: '600',
                whiteSpace: 'nowrap'
              }}>
                {progressPercent}%
              </span>
            </div>
            
            <div style={{
              width: '100%',
              background: '#e2e8f0',
              height: '12px',
              borderRadius: '8px',
              overflow: 'hidden',
              marginBottom: '1rem'
            }}>
              <div style={{
                width: `${progressPercent}%`,
                background: progressPercent === 100 ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)',
                height: '100%',
                borderRadius: '8px',
                transition: 'width 0.3s ease'
              }}></div>
            </div>
            
            {progressPercent === 100 && (
              <div style={{
                background: '#d1fae5',
                color: '#065f46',
                padding: '1rem',
                borderRadius: '8px',
                textAlign: 'center',
                fontSize: '1rem',
                fontWeight: '600',
                border: '1px solid #a7f3d0'
              }}>
                🎉 Course Completed Successfully!
              </div>
            )}
          </div>

          {/* Back Button */}
          <div style={{ 
            textAlign: 'center'
          }}>
            <Link 
              to="/courses" 
              style={{
                background: 'linear-gradient(135deg, #1f2937 0%, #374151 100%)',
                color: '#ffffff',
                textDecoration: 'none',
                padding: '0.75rem 2rem',
                borderRadius: '8px',
                fontSize: '1rem',
                fontWeight: '500',
                display: 'inline-block',
                transition: 'all 0.2s ease',
                border: '1px solid transparent'
              }}
              onMouseOver={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 8px 16px rgba(0,0,0,0.15)';
              }}
              onMouseOut={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = 'none';
              }}
            >
              ← Back to Courses
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

// Admin Panel
const AdminPanel = () => {
  const [courses, setCourses] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [usersError, setUsersError] = useState('');
  const [activeTab, setActiveTab] = useState('courses');
  const [success, setSuccess] = useState('');
  const [activities, setActivities] = useState([]);
  const [activitiesError, setActivitiesError] = useState('');

  // Untuk refresh courses dari luar (misal setelah tambah/edit)
  const fetchCourses = async () => {
    try {
      const coursesRes = await authAxios.get('/courses');
      setCourses(coursesRes.data.data);
    } catch (err) {
      setError('Failed to load admin data');
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      await fetchCourses();
      try {
        const usersRes = await authAxios.get('/users');
        setUsers(usersRes.data.data);
        setUsersError('');
        const actRes = await authAxios.get('/courses/admin/user-activities');
        setActivities(actRes.data.data);
        setActivitiesError('');
      } catch (err) {
        setUsersError('Failed to load users data');
        setActivitiesError('Failed to load activities');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const deleteCourse = async (courseId) => {
    if (window.confirm('Are you sure you want to delete this course?')) {
      try {
        await authAxios.delete(`/courses/${courseId}`);
        setCourses(courses.filter(course => course._id !== courseId));
        setSuccess('Course deleted successfully');
        setTimeout(() => setSuccess(''), 2000);
      } catch (err) {
        setError('Failed to delete course');
      }
    }
  };

  const handleCoursesUpdated = async () => {
    await fetchCourses();
    setActiveTab('courses');
  };

  if (loading) return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-3 bg-white rounded-xl shadow-lg p-6 border border-gray-200">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="text-lg font-medium text-slate-700 text-center sm:text-left">Loading admin panel...</span>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 max-w-md w-full">
        <div className="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-3">
          <div className="bg-red-100 rounded-full p-2">
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <span className="text-red-800 font-medium text-center sm:text-left">{error}</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-800 mb-2">Admin Panel</h2>
          <p className="text-slate-600 text-sm sm:text-base lg:text-lg">Manage your courses, users, and monitor activities</p>
        </div>

        {/* Success Alert */}
        {success && (
          <div className="mb-4 sm:mb-6 bg-green-50 border border-green-200 rounded-xl p-3 sm:p-4 animate-fade-in">
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
              <div className="bg-green-100 rounded-full p-2">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="text-green-800 font-medium text-sm sm:text-base">{success}</span>
            </div>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="bg-white rounded-xl shadow-sm p-2 sm:p-3 mb-6 sm:mb-8 border border-gray-200">
          {/* Mobile Dropdown */}
          <div className="block sm:hidden">
            <select 
              value={activeTab} 
              onChange={(e) => setActiveTab(e.target.value)}
              className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-slate-700 font-medium"
            >
              <option value="courses">📚 Courses</option>
              <option value="users">👥 Users</option>
              <option value="add-course">➕ Add Course</option>
              <option value="activities">📊 User Activities</option>
            </select>
          </div>

          {/* Desktop Tabs */}
          <div className="hidden sm:flex flex-wrap gap-2">
            {[
              { id: 'courses', label: 'Courses', icon: '📚' },
              { id: 'users', label: 'Users', icon: '👥' },
              { id: 'add-course', label: 'Add Course', icon: '➕' },
              { id: 'activities', label: 'User Activities', icon: '📊' }
            ].map(tab => (
              <button
                key={tab.id}
                className={`flex items-center space-x-2 px-3 sm:px-4 lg:px-6 py-2 sm:py-3 rounded-lg font-semibold transition-all duration-200 text-sm sm:text-base ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg transform scale-105'
                    : 'text-slate-600 hover:text-blue-600 hover:bg-blue-50'
                }`}
                onClick={() => setActiveTab(tab.id)}
              >
                <span className="text-base sm:text-lg">{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="tab-content">
          {activeTab === 'courses' && (
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
                <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-white">Manage Courses</h3>
                <p className="text-blue-100 mt-1 text-sm sm:text-base">View and manage all courses in the system</p>
              </div>

              {/* Mobile Card Layout */}
              <div className="block lg:hidden">
                <div className="divide-y divide-gray-100">
                  {courses.map(course => (
                    <div key={course._id} className="p-4 sm:p-6 hover:bg-gray-50 transition-colors duration-150">
                      <div className="space-y-3">
                        <div>
                          <h4 className="font-semibold text-slate-800 text-base sm:text-lg">{course.title}</h4>
                          <p className="text-slate-600 text-sm sm:text-base">by {course.instructor}</p>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-slate-500">Pages:</span>
                            <div className="mt-1">
                              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs sm:text-sm font-medium">
                                {course.pages ? course.pages.length : course.totalPages || 1}
                              </span>
                            </div>
                          </div>
                          <div>
                            <span className="text-slate-500">Students:</span>
                            <div className="mt-1">
                              <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs sm:text-sm font-medium">
                                {course.enrolledStudents.length}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex space-x-2 pt-2">
                          <Link 
                            to={`/admin/courses/edit/${course._id}`} 
                            className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors duration-200 text-center"
                          >
                            Edit
                          </Link>
                          <button 
                            onClick={() => deleteCourse(course._id)} 
                            className="flex-1 bg-red-500 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-red-600 transition-colors duration-200"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Desktop Table Layout */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="text-left py-4 px-6 font-semibold text-slate-700">Title</th>
                      <th className="text-left py-4 px-6 font-semibold text-slate-700">Instructor</th>
                      <th className="text-left py-4 px-6 font-semibold text-slate-700">Pages</th>
                      <th className="text-left py-4 px-6 font-semibold text-slate-700">Enrolled Students</th>
                      <th className="text-left py-4 px-6 font-semibold text-slate-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {courses.map(course => (
                      <tr key={course._id} className="hover:bg-gray-50 transition-colors duration-150">
                        <td className="py-4 px-6">
                          <div className="font-semibold text-slate-800">{course.title}</div>
                        </td>
                        <td className="py-4 px-6 text-slate-600">{course.instructor}</td>
                        <td className="py-4 px-6">
                          <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                            {course.pages ? course.pages.length : course.totalPages || 1}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                            {course.enrolledStudents.length}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex space-x-2">
                            <Link to={`/admin/courses/edit/${course._id}`} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors duration-200 shadow-sm hover:shadow-md">Edit</Link>
                            <button 
                              onClick={() => deleteCourse(course._id)} 
                              className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-600 transition-colors duration-200 shadow-sm hover:shadow-md"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          
          {activeTab === 'users' && (
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
                <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-white">Manage Users</h3>
                <p className="text-blue-100 mt-1 text-sm sm:text-base">View and manage all users in the system</p>
              </div>
              
              {usersError && (
                <div className="bg-red-50 border-b border-red-200 p-4 flex items-center space-x-3">
                  <div className="bg-red-100 rounded-full p-2">
                    <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <span className="text-red-800 font-medium">{usersError}</span>
                </div>
              )}
              
              {!usersError && (
                <>
                  {/* Mobile Card Layout */}
                  <div className="block lg:hidden">
                    <div className="divide-y divide-gray-100">
                      {users.map(user => (
                        <div key={user._id} className="p-4 sm:p-6 hover:bg-gray-50 transition-colors duration-150">
                          <div className="space-y-3">
                            <div>
                              <h4 className="font-semibold text-slate-800 text-base sm:text-lg">{user.name}</h4>
                              <p className="text-slate-600 text-sm sm:text-base">{user.email}</p>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="text-slate-500">Role:</span>
                                <div className="mt-1">
                                  <span className={`px-2 py-1 rounded-full text-xs sm:text-sm font-medium ${
                                    user.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                                    user.role === 'instructor' ? 'bg-blue-100 text-blue-800' :
                                    'bg-green-100 text-green-800'
                                  }`}>
                                    {user.role}
                                  </span>
                                </div>
                              </div>
                              <div>
                                <span className="text-slate-500">Courses:</span>
                                <div className="mt-1">
                                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs sm:text-sm font-medium">
                                    {user.enrolledCourses.length}
                                  </span>
                                </div>
                              </div>
                            </div>
                            
                            <div className="text-sm">
                              <span className="text-slate-500">Joined: </span>
                              <span className="text-slate-700">{new Date(user.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Desktop Table Layout */}
                  <div className="hidden lg:block overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="text-left py-4 px-6 font-semibold text-slate-700">Name</th>
                          <th className="text-left py-4 px-6 font-semibold text-slate-700">Email</th>
                          <th className="text-left py-4 px-6 font-semibold text-slate-700">Role</th>
                          <th className="text-left py-4 px-6 font-semibold text-slate-700">Enrolled Courses</th>
                          <th className="text-left py-4 px-6 font-semibold text-slate-700">Joined Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {users.map(user => (
                          <tr key={user._id} className="hover:bg-gray-50 transition-colors duration-150">
                            <td className="py-4 px-6">
                              <div className="font-semibold text-slate-800">{user.name}</div>
                            </td>
                            <td className="py-4 px-6 text-slate-600">{user.email}</td>
                            <td className="py-4 px-6">
                              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                user.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                                user.role === 'instructor' ? 'bg-blue-100 text-blue-800' :
                                'bg-green-100 text-green-800'
                              }`}>
                                {user.role}
                              </span>
                            </td>
                            <td className="py-4 px-6">
                              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                                {user.enrolledCourses.length}
                              </span>
                            </td>
                            <td className="py-4 px-6 text-slate-600">
                              {new Date(user.createdAt).toLocaleDateString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
          )}
          
          {activeTab === 'add-course' && (
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 sm:p-6 lg:p-8">
              <CourseForm onSuccess={handleCoursesUpdated} />
            </div>
          )}

          {activeTab === 'activities' && (
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
                <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-white">User Activities</h3>
                <p className="text-blue-100 mt-1 text-sm sm:text-base">Monitor user progress and course activities</p>
              </div>
              
              {activitiesError && (
                <div className="bg-red-50 border-b border-red-200 p-4 flex items-center space-x-3">
                  <div className="bg-red-100 rounded-full p-2">
                    <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <span className="text-red-800 font-medium">{activitiesError}</span>
                </div>
              )}
              
              {!activitiesError && (
                <>
                  {/* Mobile Card Layout */}
                  <div className="block xl:hidden">
                    <div className="divide-y divide-gray-100">
                      {activities.map(act => {
                        const percent = typeof act.progressPercent === 'number'
                          ? act.progressPercent
                          : (act.totalPages && act.totalPages > 0 ? Math.round((act.currentPage / act.totalPages) * 100) : 0);
                        return (
                          <div key={act._id} className="p-4 sm:p-6 hover:bg-gray-50 transition-colors duration-150">
                            <div className="space-y-4">
                              <div>
                                <h4 className="font-semibold text-slate-800 text-base sm:text-lg">{act.userName}</h4>
                                <p className="text-slate-600 text-sm">{act.userEmail}</p>
                                <p className="text-slate-700 text-sm sm:text-base font-medium mt-1">{act.courseTitle}</p>
                              </div>
                              
                              <div className="space-y-3">
                                <div>
                                  <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm text-slate-600">Progress</span>
                                    <span className="text-sm font-medium text-slate-700">{percent}%</span>
                                  </div>
                                  <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div 
                                      className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-300"
                                      style={{ width: `${percent}%` }}
                                    ></div>
                                  </div>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                  <div>
                                    <span className="text-slate-500">Completed:</span>
                                    <div className="mt-1">
                                      {act.isCompleted || percent === 100 ? (
                                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">Yes</span>
                                      ) : (
                                        <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs font-medium">No</span>
                                      )}
                                    </div>
                                  </div>
                                  <div>
                                    <span className="text-slate-500">Last Access:</span>
                                    <div className="mt-1 text-xs text-slate-600">
                                      {act.lastAccess ? new Date(act.lastAccess).toLocaleDateString() : '-'}
                                    </div>
                                  </div>
                                </div>
                                
                                <button
                                  className="w-full bg-red-500 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-red-600 transition-colors duration-200"
                                  onClick={() => {
                                    if (window.confirm(`Remove this activity for user ${act.userName}?`)) {
                                      setActivities(activities => activities.filter(a => a._id !== act._id));
                                    }
                                  }}
                                >
                                  Remove Activity
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Desktop Table Layout */}
                  <div className="hidden xl:block overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="text-left py-4 px-6 font-semibold text-slate-700">User</th>
                          <th className="text-left py-4 px-6 font-semibold text-slate-700">Course</th>
                          <th className="text-left py-4 px-6 font-semibold text-slate-700">Progress (%)</th>
                          <th className="text-left py-4 px-6 font-semibold text-slate-700">Completed</th>
                          <th className="text-left py-4 px-6 font-semibold text-slate-700">Last Access</th>
                          <th className="text-left py-4 px-6 font-semibold text-slate-700">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {activities.map(act => {
                          const percent = typeof act.progressPercent === 'number'
                            ? act.progressPercent
                            : (act.totalPages && act.totalPages > 0 ? Math.round((act.currentPage / act.totalPages) * 100) : 0);
                          return (
                            <tr key={act._id} className="hover:bg-gray-50 transition-colors duration-150">
                              <td className="py-4 px-6">
                                <div>
                                  <div className="font-semibold text-slate-800">{act.userName}</div>
                                  <div className="text-sm text-slate-500">({act.userEmail})</div>
                                </div>
                              </td>
                              <td className="py-4 px-6">
                                <div className="font-medium text-slate-700">{act.courseTitle}</div>
                              </td>
                              <td className="py-4 px-6">
                                <div className="flex items-center space-x-3">
                                  <div className="w-24 bg-gray-200 rounded-full h-2">
                                    <div 
                                      className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-300"
                                      style={{ width: `${percent}%` }}
                                    ></div>
                                  </div>
                                  <span className="text-sm font-medium text-slate-700">{percent}%</span>
                                </div>
                              </td>
                              <td className="py-4 px-6">
                                {act.isCompleted || percent === 100 ? (
                                  <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">Yes</span>
                                ) : (
                                  <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm font-medium">No</span>
                                )}
                              </td>
                              <td className="py-4 px-6 text-slate-600">
                                {act.lastAccess ? new Date(act.lastAccess).toLocaleString() : '-'}
                              </td>
                              <td className="py-4 px-6">
                                <button
                                  className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-600 transition-colors duration-200 shadow-sm hover:shadow-md"
                                  onClick={() => {
                                    if (window.confirm(`Remove this activity for user ${act.userName}?`)) {
                                      setActivities(activities => activities.filter(a => a._id !== act._id));
                                    }
                                  }}
                                >
                                  Remove Activity
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Course Form Component (used for both Add and Edit)
const CourseForm = ({ courseId, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    instructor: '',
    duration: '',
    totalPages: 1,
    pages: [''] // array of page contents
  });
  const [loading, setLoading] = useState(courseId ? true : false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCourse = async () => {
      if (courseId) {
        try {
          const res = await authAxios.get(`/courses/${courseId}`);
          const course = res.data.data;
          setFormData({
            title: course.title,
            description: course.description,
            instructor: course.instructor,
            duration: course.duration,
            totalPages: course.totalPages || (course.pages ? course.pages.length : 1),
            pages: course.pages && course.pages.length > 0 ? course.pages : [course.content || '']
          });
        } catch (err) {
          setError('Failed to load course data');
        } finally {
          setLoading(false);
        }
      }
    };
    fetchCourse();
  }, [courseId]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handlePageChange = (idx, value) => {
    const newPages = [...formData.pages];
    newPages[idx] = value;
    setFormData({ ...formData, pages: newPages });
  };

  const handleTotalPagesChange = (e) => {
    const newTotal = parseInt(e.target.value) || 1;
    let newPages = [...formData.pages];
    if (newTotal > newPages.length) {
      newPages = [...newPages, ...Array(newTotal - newPages.length).fill('')];
    } else if (newTotal < newPages.length) {
      newPages = newPages.slice(0, newTotal);
    }
    setFormData({ ...formData, totalPages: newTotal, pages: newPages });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      const data = {
        ...formData,
        duration: Number(formData.duration),
        content: undefined, // not used anymore
        pages: formData.pages,
        totalPages: formData.pages.length
      };
      if (courseId) {
        await authAxios.put(`/courses/${courseId}`, data);
        setSuccess('Course updated successfully');
        if (onSuccess) {
          await onSuccess();
        }
        setTimeout(() => {
          navigate('/admin');
        }, 1000);
      } else {
        await authAxios.post('/courses', data);
        setSuccess('Course created successfully');
        setFormData({
          title: '',
          description: '',
          instructor: '',
          duration: '',
          totalPages: 1,
          pages: ['']
        });
        if (onSuccess) {
          await onSuccess();
        }
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save course');
    }
  };

  if (loading) return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      padding: '1rem',
      background: '#ffffff'
    }}>
      <div style={{
        background: '#ffffff',
        padding: '2rem',
        borderRadius: '16px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        border: '1px solid #e5e7eb',
        textAlign: 'center',
        maxWidth: '90%',
        width: '100%',
        maxWidth: '400px'
      }}>
        <div style={{
          width: '48px',
          height: '48px',
          border: '3px solid #e5e7eb',
          borderTop: '3px solid #2563eb',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '0 auto 1rem auto'
        }}></div>
        <p style={{
          color: '#1f2937',
          fontSize: '1.125rem',
          fontWeight: '500',
          margin: '0'
        }}>
          Loading course data...
        </p>
      </div>
    </div>
  );

  return (
    <div style={{
      background: '#ffffff',
      minHeight: '100vh',
      padding: '1rem'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        width: '100%'
      }}>
        <div style={{
          background: '#ffffff',
          borderRadius: '16px',
          boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
          border: '1px solid #e5e7eb',
          overflow: 'hidden'
        }}>
          
          {/* Header */}
          <div style={{
            background: 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)',
            padding: '2rem 1.5rem',
            textAlign: 'center'
          }}>
            <h1 style={{
              fontSize: 'clamp(1.5rem, 4vw, 2.25rem)',
              fontWeight: '700',
              color: '#ffffff',
              margin: '0',
              letterSpacing: '-0.025em'
            }}>
              {courseId ? 'Edit Course' : 'Add New Course'}
            </h1>
          </div>

          {/* Content */}
          <div style={{
            padding: 'clamp(1rem, 4vw, 2rem)',
            background: '#ffffff'
          }}>
            
            {/* Alerts */}
            {error && (
              <div style={{
                marginBottom: '1.5rem',
                background: '#fef2f2',
                border: '1px solid #fecaca',
                color: '#dc2626',
                padding: '1rem 1.5rem',
                borderRadius: '12px',
                fontSize: '0.875rem',
                fontWeight: '500'
              }}>
                {error}
              </div>
            )}
            
            {success && (
              <div style={{
                marginBottom: '1.5rem',
                background: '#f0fdf4',
                border: '1px solid #bbf7d0',
                color: '#166534',
                padding: '1rem 1.5rem',
                borderRadius: '12px',
                fontSize: '0.875rem',
                fontWeight: '500'
              }}>
                {success}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              
              {/* Basic Info Section */}
              <div style={{
                background: '#f8fafc',
                borderRadius: '12px',
                padding: 'clamp(1rem, 3vw, 1.5rem)',
                border: '1px solid #e2e8f0',
                marginBottom: '1.5rem'
              }}>
                <h2 style={{
                  fontSize: 'clamp(1.125rem, 2.5vw, 1.25rem)',
                  fontWeight: '600',
                  color: '#1f2937',
                  margin: '0 0 1.5rem 0',
                  paddingBottom: '0.5rem',
                  borderBottom: '2px solid #2563eb',
                  display: 'inline-block'
                }}>
                  Basic Information
                </h2>
                
                {/* Title and Instructor Grid */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                  gap: '1.5rem',
                  marginBottom: '1.5rem'
                }}>
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      color: '#374151',
                      marginBottom: '0.5rem'
                    }}>
                      Course Title *
                    </label>
                    <input 
                      type="text" 
                      name="title" 
                      value={formData.title} 
                      onChange={handleChange} 
                      required 
                      style={{
                        width: '100%',
                        padding: '0.75rem 1rem',
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        fontSize: '1rem',
                        background: '#ffffff',
                        transition: 'all 0.2s ease',
                        outline: 'none'
                      }}
                      placeholder="Enter course title..."
                      onFocus={(e) => {
                        e.target.style.borderColor = '#2563eb';
                        e.target.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.1)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#d1d5db';
                        e.target.style.boxShadow = 'none';
                      }}
                    />
                  </div>
                  
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      color: '#374151',
                      marginBottom: '0.5rem'
                    }}>
                      Instructor *
                    </label>
                    <input 
                      type="text" 
                      name="instructor" 
                      value={formData.instructor} 
                      onChange={handleChange} 
                      required 
                      style={{
                        width: '100%',
                        padding: '0.75rem 1rem',
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        fontSize: '1rem',
                        background: '#ffffff',
                        transition: 'all 0.2s ease',
                        outline: 'none'
                      }}
                      placeholder="Enter instructor name..."
                      onFocus={(e) => {
                        e.target.style.borderColor = '#2563eb';
                        e.target.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.1)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#d1d5db';
                        e.target.style.boxShadow = 'none';
                      }}
                    />
                  </div>
                </div>

                {/* Description */}
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    color: '#374151',
                    marginBottom: '0.5rem'
                  }}>
                    Description *
                  </label>
                  <textarea 
                    name="description" 
                    value={formData.description} 
                    onChange={handleChange} 
                    required 
                    rows="4"
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '1rem',
                      background: '#ffffff',
                      transition: 'all 0.2s ease',
                      outline: 'none',
                      resize: 'vertical',
                      minHeight: '100px'
                    }}
                    placeholder="Enter course description..."
                    onFocus={(e) => {
                      e.target.style.borderColor = '#2563eb';
                      e.target.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#d1d5db';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                </div>

                {/* Duration and Total Pages Grid */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '1.5rem'
                }}>
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      color: '#374151',
                      marginBottom: '0.5rem'
                    }}>
                      Duration (hours) *
                    </label>
                    <input 
                      type="number" 
                      name="duration" 
                      value={formData.duration} 
                      onChange={handleChange} 
                      required 
                      min="1"
                      style={{
                        width: '100%',
                        padding: '0.75rem 1rem',
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        fontSize: '1rem',
                        background: '#ffffff',
                        transition: 'all 0.2s ease',
                        outline: 'none'
                      }}
                      placeholder="Enter duration..."
                      onFocus={(e) => {
                        e.target.style.borderColor = '#2563eb';
                        e.target.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.1)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#d1d5db';
                        e.target.style.boxShadow = 'none';
                      }}
                    />
                  </div>
                  
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      color: '#374151',
                      marginBottom: '0.5rem'
                    }}>
                      Total Pages *
                    </label>
                    <input
                      type="number"
                      name="totalPages"
                      value={formData.totalPages}
                      min="1"
                      onChange={handleTotalPagesChange}
                      required
                      style={{
                        width: '100%',
                        padding: '0.75rem 1rem',
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        fontSize: '1rem',
                        background: '#ffffff',
                        transition: 'all 0.2s ease',
                        outline: 'none'
                      }}
                      placeholder="Number of pages..."
                      onFocus={(e) => {
                        e.target.style.borderColor = '#2563eb';
                        e.target.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.1)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#d1d5db';
                        e.target.style.boxShadow = 'none';
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Course Content Section */}
              <div style={{
                background: '#f1f5f9',
                borderRadius: '12px',
                padding: 'clamp(1rem, 3vw, 1.5rem)',
                border: '1px solid #e2e8f0',
                marginBottom: '2rem'
              }}>
                <h2 style={{
                  fontSize: 'clamp(1.125rem, 2.5vw, 1.25rem)',
                  fontWeight: '600',
                  color: '#1f2937',
                  margin: '0 0 1.5rem 0',
                  paddingBottom: '0.5rem',
                  borderBottom: '2px solid #2563eb',
                  display: 'inline-block'
                }}>
                  Course Content
                </h2>
                
                {/* Pages Content */}
                <div style={{
                  display: 'grid',
                  gap: '1rem'
                }}>
                  {formData.pages.map((page, idx) => (
                    <div key={idx} style={{
                      background: '#ffffff',
                      borderRadius: '8px',
                      padding: '1.5rem',
                      border: '1px solid #e2e8f0',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                    }}>
                      <label style={{
                        display: 'block',
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        color: '#374151',
                        marginBottom: '0.75rem'
                      }}>
                        📄 Page {idx + 1} Content *
                      </label>
                      <textarea
                        value={page}
                        onChange={e => handlePageChange(idx, e.target.value)}
                        required
                        rows="4"
                        style={{
                          width: '100%',
                          padding: '0.75rem 1rem',
                          border: '1px solid #d1d5db',
                          borderRadius: '8px',
                          fontSize: '1rem',
                          background: '#ffffff',
                          transition: 'all 0.2s ease',
                          outline: 'none',
                          resize: 'vertical',
                          minHeight: '120px',
                          fontFamily: 'inherit'
                        }}
                        placeholder={`Enter content for page ${idx + 1}...`}
                        onFocus={(e) => {
                          e.target.style.borderColor = '#2563eb';
                          e.target.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.1)';
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = '#d1d5db';
                          e.target.style.boxShadow = 'none';
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Form Actions */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
                paddingTop: '1.5rem',
                borderTop: '1px solid #e2e8f0'
              }}>
                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '1rem',
                  justifyContent: 'center'
                }}>
                  <button 
                    type="submit" 
                    style={{
                      background: 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)',
                      color: '#ffffff',
                      padding: '0.875rem 2rem',
                      borderRadius: '8px',
                      fontWeight: '600',
                      fontSize: '1rem',
                      border: 'none',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      minWidth: '160px',
                      boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)'
                    }}
                    onMouseOver={(e) => {
                      e.target.style.transform = 'translateY(-2px)';
                      e.target.style.boxShadow = '0 8px 20px rgba(37, 99, 235, 0.4)';
                    }}
                    onMouseOut={(e) => {
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = '0 4px 12px rgba(37, 99, 235, 0.3)';
                    }}
                  >
                    {courseId ? 'Update Course' : 'Create Course'}
                  </button>
                  
                  {courseId && (
                    <button 
                      type="button" 
                      onClick={() => navigate('/admin')} 
                      style={{
                        background: '#f3f4f6',
                        color: '#374151',
                        padding: '0.875rem 2rem',
                        borderRadius: '8px',
                        fontWeight: '600',
                        fontSize: '1rem',
                        border: '1px solid #d1d5db',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        minWidth: '120px'
                      }}
                      onMouseOver={(e) => {
                        e.target.style.background = '#e5e7eb';
                        e.target.style.transform = 'translateY(-1px)';
                      }}
                      onMouseOut={(e) => {
                        e.target.style.background = '#f3f4f6';
                        e.target.style.transform = 'translateY(0)';
                      }}
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
      
      {/* Keyframes for spinner */}
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};

// Edit Course Page
const EditCourse = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const handleSuccess = async () => {
    // Tidak perlu fetch di sini, karena akan redirect ke /admin yang sudah fetch
  };
  
  return (
    <div style={{
      background: '#ffffff',
      minHeight: '100vh'
    }}>
      <CourseForm courseId={id} onSuccess={handleSuccess} />
    </div>
  );
};

// Main App Component
function App() {
  return (
    <Router>
      <AuthProvider>
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          background: '#ffffff'
        }}>
          <Navbar />
          <main style={{ flex: '1' }}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route 
                path="/courses" 
                element={
                  <PrivateRoute>
                    <CoursesList />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/courses/:id" 
                element={
                  <PrivateRoute>
                    <CourseDetail />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/admin" 
                element={
                  <AdminRoute>
                    <AdminPanel />
                  </AdminRoute>
                } 
              />
              <Route 
                path="/admin/courses/edit/:id" 
                element={
                  <AdminRoute>
                    <EditCourse />
                  </AdminRoute>
                } 
              />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </main>
          <footer style={{
            background: '#1f2937',
            color: '#ffffff',
            padding: '1.5rem 1rem',
            textAlign: 'center'
          }}>
            <div style={{
              maxWidth: '1200px',
              margin: '0 auto'
            }}>
              <p style={{
                fontSize: '0.875rem',
                margin: '0'
              }}>
                &copy; {new Date().getFullYear()} E-Course Platform. All rights reserved.
              </p>
            </div>
          </footer>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;