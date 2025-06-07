import React, { useState, useEffect, createContext, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useNavigate, useParams } from "react-router-dom";
import { Link } from 'react-router-dom';
import './index.css'; 
import axios from 'axios';

// Set base URL for API
const API_URL = 'http://localhost:5000/api';

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

  return (
    <nav className="bg-gradient-to-r from-slate-900 via-blue-900 to-slate-800 shadow-xl border-b border-slate-700 px-6 py-4">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">E</span>
          </div>
          <Link 
            to="/" 
            className="text-xl font-bold bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent hover:from-blue-200 hover:to-white transition-all duration-300"
          >
            E-Course Platform
          </Link>
        </div>

        <div className="flex items-center space-x-6">
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
          
          {currentUser ? (
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3 bg-slate-800/50 px-4 py-2 rounded-lg border border-slate-600">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">{currentUser.name.charAt(0)}</span>
                </div>
                <span className="text-gray-300 text-sm">
                  Welcome, <span className="text-white font-medium">{currentUser.name}</span>
                </span>
              </div>
              <button 
                onClick={logout} 
                className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-5 py-2 rounded-lg font-medium transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-3">
              <Link 
                to="/login" 
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-5 py-2 rounded-lg font-medium transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Login
              </Link>
              <Link 
                to="/register" 
                className="bg-slate-600 hover:bg-slate-700 text-white px-5 py-2 rounded-lg font-medium transition-all duration-300 border border-slate-500 hover:border-slate-400 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

// Home Page
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

  if (!currentUser) return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-white">
      <div className="container mx-auto px-6 py-20">
        <div className="text-center max-w-4xl mx-auto">
          <div className="mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-xl">
              <span className="text-white text-3xl font-bold">E</span>
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-slate-800 to-blue-600 bg-clip-text text-transparent mb-6">
              Welcome to E-Course Platform
            </h1>
            <p className="text-xl text-slate-600 mb-8 leading-relaxed">
              Learn new skills with our comprehensive online courses
            </p>
          </div>
          <Link 
            to="/courses" 
            className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
          >
            Browse Courses
            <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-white">
      <div className="container mx-auto px-6 py-8">
        {/* Header Section */}
        <div className="mb-12">
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-200">
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center">
                <span className="text-white text-2xl font-bold">{currentUser.name.charAt(0)}</span>
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-blue-600 bg-clip-text text-transparent">
                  Welcome, {currentUser.name}
                </h1>
                <p className="text-slate-600 text-lg">Here are your enrolled courses</p>
              </div>
            </div>
          </div>
        </div>

        {/* Content Section */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-200">
              <div className="flex items-center space-x-4">
                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-slate-600 text-lg">Loading your courses...</span>
              </div>
            </div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 shadow-lg">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">!</span>
              </div>
              <span className="text-red-700 font-medium">{error}</span>
            </div>
          </div>
        ) : enrolledCourses.length === 0 ? (
          <div className="text-center py-20">
            <div className="bg-white rounded-2xl shadow-xl p-12 border border-slate-200 max-w-md mx-auto">
              <div className="w-16 h-16 bg-slate-100 rounded-full mx-auto mb-6 flex items-center justify-center">
                <span className="text-slate-400 text-2xl">📚</span>
              </div>
              <h3 className="text-xl font-semibold text-slate-800 mb-2">No Courses Yet</h3>
              <p className="text-slate-600">You have not enrolled in any courses yet.</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {enrolledCourses.map(course => {
              const prog = progresses[course._id];
              const isCompleted = prog && prog.isCompleted;
              return (
                <div key={course._id} className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-200 overflow-hidden group">
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="text-xl font-bold text-slate-800 group-hover:text-blue-600 transition-colors duration-300">
                        {course.title}
                      </h3>
                      {isCompleted && (
                        <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                          ✓ Completed
                        </div>
                      )}
                    </div>
                    
                    <p className="text-slate-600 mb-4 line-clamp-3">{course.description}</p>
                    
                    <div className="space-y-2 mb-6">
                      <div className="flex items-center text-sm text-slate-500">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        Instructor: {course.instructor}
                      </div>
                      <div className="flex items-center text-sm text-slate-500">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Duration: {course.duration} hours
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      <Link 
                        to={`/courses/${course._id}`} 
                        className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2 rounded-lg font-medium hover:from-blue-700 hover:to-blue-800 transition-all duration-300 text-center"
                      >
                        View Details
                      </Link>
                      {currentUser.role === 'student' && (
                        <button 
                          onClick={() => unenrollCourse(course._id)} 
                          className="px-4 py-2 bg-slate-100 text-slate-600 rounded-lg font-medium hover:bg-red-50 hover:text-red-600 transition-all duration-300 border border-slate-200"
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-white flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-200">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl mx-auto mb-4 flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-blue-600 bg-clip-text text-transparent">
              Welcome Back
            </h2>
            <p className="text-slate-600 mt-2">Sign in to continue your learning journey</p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xs font-bold">!</span>
                </div>
                <span className="text-red-700 font-medium">{error}</span>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Email Address
              </label>
              <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 bg-slate-50 focus:bg-white"
                placeholder="Enter your email"
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Password
              </label>
              <input 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 bg-slate-50 focus:bg-white"
                placeholder="Enter your password"
              />
            </div>
            
            <button 
              type="submit" 
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-4 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              Sign In
            </button>
          </form>

          {/* Footer */}
          <div className="text-center mt-8 pt-6 border-t border-slate-200">
            <p className="text-slate-600">
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-white flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-200">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl mx-auto mb-4 flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-blue-600 bg-clip-text text-transparent">
              Join Us Today
            </h2>
            <p className="text-slate-600 mt-2">Create your account to start learning</p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xs font-bold">!</span>
                </div>
                <span className="text-red-700 font-medium">{error}</span>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Full Name
              </label>
              <input 
                type="text" 
                name="name" 
                value={formData.name} 
                onChange={handleChange} 
                required 
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 bg-slate-50 focus:bg-white"
                placeholder="Enter your full name"
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Email Address
              </label>
              <input 
                type="email" 
                name="email" 
                value={formData.email} 
                onChange={handleChange} 
                required 
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 bg-slate-50 focus:bg-white"
                placeholder="Enter your email"
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Password
              </label>
              <input 
                type="password" 
                name="password" 
                value={formData.password} 
                onChange={handleChange} 
                required 
                minLength="6"
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 bg-slate-50 focus:bg-white"
                placeholder="Create a password (min. 6 characters)"
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Account Type
              </label>
              <div className="relative">
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 bg-slate-50 focus:bg-white appearance-none cursor-pointer"
                >
                  <option value="student">Student Account</option>
                  <option value="admin">Admin Account</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                  <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
            
            <button 
              type="submit" 
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-4 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              Create Account
            </button>
          </form>

          {/* Footer */}
          <div className="text-center mt-8 pt-6 border-t border-slate-200">
            <p className="text-slate-600">
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
      // Coba endpoint user/enroll/:courseId (sesuai userRoutes.js)
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
      // Jika 404, fallback ke endpoint lain (opsional)
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-white flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-200">
        <div className="flex items-center space-x-4">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-slate-600 text-lg">Loading courses...</span>
        </div>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-white flex items-center justify-center">
      <div className="bg-red-50 border border-red-200 rounded-2xl p-8 shadow-xl max-w-md">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-bold">!</span>
          </div>
          <span className="text-red-700 font-medium">{error}</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-white">
      <div className="container mx-auto px-6 py-8">
        {/* Header Section */}
        <div className="mb-12">
          <div className="text-center max-w-3xl mx-auto">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl mx-auto mb-6 flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h2 className="text-4xl font-bold bg-gradient-to-r from-slate-800 to-blue-600 bg-clip-text text-transparent mb-4">
              Available Courses
            </h2>
            <p className="text-slate-600 text-lg">
              Discover and enroll in courses that match your learning goals
            </p>
          </div>
        </div>

        {/* Courses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {courses.map(course => {
            const userId = currentUser?.id || currentUser?._id;
            const enrolledStudents = Array.isArray(course.enrolledStudents) ? course.enrolledStudents : [];
            const isEnrolled = enrolledStudents.includes(userId);
            return (
              <div key={course._id} className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-200 overflow-hidden group">
                {/* Course Header */}
                <div className="p-6 pb-4">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-xl font-bold text-slate-800 group-hover:text-blue-600 transition-colors duration-300 line-clamp-2">
                      {course.title}
                    </h3>
                    {isEnrolled && (
                      <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span>Enrolled</span>
                      </div>
                    )}
                  </div>
                  
                  <p className="text-slate-600 mb-6 line-clamp-3">{course.description}</p>
                  
                  {/* Course Details */}
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center text-sm text-slate-500">
                      <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span className="font-medium">Instructor:</span>
                      <span className="ml-1">{course.instructor}</span>
                    </div>
                    <div className="flex items-center text-sm text-slate-500">
                      <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="font-medium">Duration:</span>
                      <span className="ml-1">{course.duration} hours</span>
                    </div>
                  </div>
                </div>

                {/* Course Actions */}
                <div className="px-6 py-4 bg-slate-50 border-t border-slate-100">
                  <div className="flex flex-wrap gap-2">
                    {/* View Details Button */}
                    <Link 
                      to={isEnrolled ? `/courses/${course._id}` : '#'}
                      className={`flex-1 text-center px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                        isEnrolled 
                          ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 transform hover:scale-105' 
                          : 'bg-slate-200 text-slate-400 cursor-not-allowed'
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
                      <>
                        <button 
                          onClick={() => enrollCourse(course._id)} 
                          disabled={isEnrolled}
                          className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                            isEnrolled 
                              ? 'bg-green-100 text-green-700 cursor-default' 
                              : 'bg-slate-600 hover:bg-slate-700 text-white transform hover:scale-105'
                          }`}
                        >
                          {isEnrolled ? 'Enrolled' : 'Enroll'}
                        </button>
                        {isEnrolled && (
                          <button 
                            onClick={() => unenrollCourse(course._id)} 
                            className="px-4 py-2 bg-red-100 text-red-600 rounded-lg font-medium hover:bg-red-200 transition-all duration-300"
                          >
                            Unenroll
                          </button>
                        )}
                      </>
                    )}

                    {/* Admin Actions */}
                    {currentUser && currentUser.role === 'admin' && (
                      <div className="flex gap-2 w-full">
                        <button
                          className="flex-1 px-4 py-2 bg-yellow-100 text-yellow-700 rounded-lg font-medium hover:bg-yellow-200 transition-all duration-300"
                          onClick={() => navigate(`/admin/courses/edit/${course._id}`)}
                        >
                          Edit
                        </button>
                        <button
                          className="flex-1 px-4 py-2 bg-red-100 text-red-600 rounded-lg font-medium hover:bg-red-200 transition-all duration-300"
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
          <div className="text-center py-20">
            <div className="bg-white rounded-2xl shadow-xl p-12 border border-slate-200 max-w-md mx-auto">
              <div className="w-16 h-16 bg-slate-100 rounded-full mx-auto mb-6 flex items-center justify-center">
                <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-slate-800 mb-2">No Courses Available</h3>
              <p className="text-slate-600">Check back later for new courses.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Course Detail Page
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
      minHeight: '60vh',
      fontSize: '18px',
      color: '#2563eb'
    }}>
      <div style={{
        padding: '30px',
        background: '#f0f6ff',
        borderRadius: '12px',
        boxShadow: '0 2px 10px rgba(37,99,235,0.08)',
        border: '1px solid #dbeafe'
      }}>
        Loading course details...
      </div>
    </div>
  );

  if (error) return (
    <div style={{
      margin: '40px',
      padding: '20px',
      background: '#f0f6ff',
      color: '#dc2626',
      borderRadius: '12px',
      border: '1px solid #fecaca',
      boxShadow: '0 2px 10px rgba(220,38,38,0.08)'
    }}>
      {error}
    </div>
  );

  if (!course) return (
    <div style={{
      textAlign: 'center',
      margin: '40px',
      padding: '40px',
      background: '#f0f6ff',
      borderRadius: '12px',
      color: '#1e293b',
      border: '1px solid #dbeafe',
      boxShadow: '0 2px 10px rgba(37,99,235,0.08)'
    }}>
      Course not found
    </div>
  );

  if (!isEnrolled && currentUser && currentUser.role === 'student') {
    return (
      <div style={{
        margin: '40px',
        padding: '25px',
        background: '#f0f6ff',
        color: '#b45309',
        borderRadius: '12px',
        border: '1px solid #fde68a',
        boxShadow: '0 2px 10px rgba(251,191,36,0.08)',
        textAlign: 'center',
        fontSize: '16px'
      }}>
        You are not enrolled in this course.
      </div>
    );
  }

  return (
    <div style={{
      background: 'linear-gradient(135deg, #f8fafc 0%, #dbeafe 100%)',
      minHeight: '100vh',
      padding: '40px 0'
    }}>
      <div style={{
        maxWidth: '1000px',
        margin: '0 auto',
        background: '#fff',
        borderRadius: '16px',
        boxShadow: '0 4px 24px rgba(30,41,59,0.10)',
        border: '1px solid #e0e7ef',
        overflow: 'hidden'
      }}>
        
        {/* Header Section */}
        <div style={{
          background: 'linear-gradient(90deg, #2563eb 0%, #1e40af 100%)',
          color: '#fff',
          padding: '48px 40px 36px 40px',
          borderBottom: '3px solid #1e293b'
        }}>
          <h2 style={{
            margin: '0 0 30px 0',
            fontSize: '2.8rem',
            fontWeight: '700',
            letterSpacing: '-1px',
            textAlign: 'center'
          }}>
            {course.title}
          </h2>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '20px',
            marginTop: '30px'
          }}>
            <div style={{
              background: 'rgba(255,255,255,0.10)',
              padding: '15px 20px',
              borderRadius: '8px',
              borderLeft: '4px solid #60a5fa'
            }}>
              <div style={{ fontSize: '14px', opacity: '0.85', marginBottom: '5px' }}>Instructor</div>
              <div style={{ fontSize: '16px', fontWeight: '500' }}>{course.instructor}</div>
            </div>
            <div style={{
              background: 'rgba(255,255,255,0.10)',
              padding: '15px 20px',
              borderRadius: '8px',
              borderLeft: '4px solid #60a5fa'
            }}>
              <div style={{ fontSize: '14px', opacity: '0.85', marginBottom: '5px' }}>Duration</div>
              <div style={{ fontSize: '16px', fontWeight: '500' }}>{course.duration} hours</div>
            </div>
            <div style={{
              background: 'rgba(255,255,255,0.10)',
              padding: '15px 20px',
              borderRadius: '8px',
              borderLeft: '4px solid #60a5fa'
            }}>
              <div style={{ fontSize: '14px', opacity: '0.85', marginBottom: '5px' }}>Created</div>
              <div style={{ fontSize: '16px', fontWeight: '500' }}>{new Date(course.createdAt).toLocaleDateString()}</div>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div style={{ padding: '40px', background: '#f8fafc' }}>
          
          {/* Description */}
          <div style={{
            background: '#fff',
            padding: '30px',
            borderRadius: '8px',
            marginBottom: '30px',
            border: '1px solid #dbeafe'
          }}>
            <h3 style={{
              color: '#2563eb',
              marginBottom: '20px',
              fontSize: '1.5rem',
              fontWeight: '600',
              borderBottom: '2px solid #2563eb',
              paddingBottom: '10px',
              display: 'inline-block'
            }}>
              Course Description
            </h3>
            <p style={{
              color: '#334155',
              lineHeight: '1.6',
              fontSize: '16px',
              margin: '0'
            }}>
              {course.description}
            </p>
          </div>

          {/* Course Content */}
          <div style={{
            background: '#fff',
            border: '1px solid #dbeafe',
            borderRadius: '8px',
            overflow: 'hidden',
            boxShadow: '0 2px 10px rgba(37,99,235,0.05)'
          }}>
            <div style={{
              background: 'linear-gradient(90deg, #2563eb 0%, #1e40af 100%)',
              color: '#fff',
              padding: '20px 30px',
              fontSize: '1.3rem',
              fontWeight: '600',
              borderBottom: '1px solid #1e293b'
            }}>
              Course Content
            </div>
            
            <div style={{
              padding: '30px',
              minHeight: '300px',
              background: '#f1f5f9',
              borderBottom: '1px solid #dbeafe'
            }}>
              <div style={{
                background: '#fff',
                padding: '25px',
                borderRadius: '8px',
                border: '1px solid #dbeafe',
                lineHeight: '1.7',
                fontSize: '16px',
                color: '#1e293b',
                minHeight: '200px',
                whiteSpace: 'pre-wrap'
              }}>
                {renderPageContent()}
              </div>
            </div>
            
            {/* Navigation Controls */}
            <div style={{
              background: '#f0f6ff',
              padding: '20px 30px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderTop: '1px solid #dbeafe'
            }}>
              <button 
                onClick={handlePrevPage} 
                disabled={currentPage === 1}
                style={{
                  background: currentPage === 1 ? '#94a3b8' : 'linear-gradient(90deg, #2563eb 0%, #1e40af 100%)',
                  color: '#fff',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '6px',
                  cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  transition: 'background-color 0.2s ease'
                }}
              >
                Previous
              </button>
              
              <div style={{
                background: '#2563eb',
                color: '#fff',
                padding: '10px 20px',
                borderRadius: '6px',
                fontWeight: '500',
                fontSize: '14px'
              }}>
                Page {currentPage} of {totalPages}
              </div>
              
              <button 
                onClick={handleNextPage}
                style={{
                  background: 'linear-gradient(90deg, #2563eb 0%, #1e40af 100%)',
                  color: '#fff',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  transition: 'background-color 0.2s ease'
                }}
              >
                {currentPage === totalPages ? 'Restart' : 'Next'}
              </button>
            </div>
          </div>

          {/* Progress Section */}
          <div style={{
            background: '#fff',
            padding: '25px',
            borderRadius: '8px',
            marginTop: '30px',
            border: '1px solid #dbeafe'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '15px'
            }}>
              <h4 style={{
                color: '#2563eb',
                fontWeight: '600',
                fontSize: '1.2rem',
                margin: '0',
                borderBottom: '2px solid #2563eb',
                paddingBottom: '5px',
                display: 'inline-block'
              }}>
                Learning Progress
              </h4>
              <span style={{
                background: progressPercent === 100 ? '#22c55e' : '#2563eb',
                color: '#fff',
                padding: '8px 16px',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '500'
              }}>
                {progressPercent}%
              </span>
            </div>
            
            <div style={{
              width: '100%',
              background: '#dbeafe',
              height: '8px',
              borderRadius: '6px',
              overflow: 'hidden'
            }}>
              <div style={{
                width: `${progressPercent}%`,
                background: progressPercent === 100 ? '#22c55e' : 'linear-gradient(90deg, #2563eb 0%, #1e40af 100%)',
                height: '100%',
                borderRadius: '6px',
                transition: 'width 0.3s ease'
              }}></div>
            </div>
            
            {progressPercent === 100 && (
              <div style={{
                background: '#dcfce7',
                color: '#166534',
                padding: '15px',
                borderRadius: '6px',
                marginTop: '15px',
                textAlign: 'center',
                fontSize: '16px',
                fontWeight: '500',
                border: '1px solid #bbf7d0'
              }}>
                Course Completed Successfully!
              </div>
            )}
          </div>

          {/* Back Button */}
          <div style={{ textAlign: 'center', marginTop: '40px' }}>
            <Link 
              to="/courses" 
              style={{
                background: 'linear-gradient(90deg, #1e293b 0%, #2563eb 100%)',
                color: '#fff',
                textDecoration: 'none',
                padding: '12px 30px',
                borderRadius: '6px',
                fontSize: '16px',
                fontWeight: '500',
                display: 'inline-block',
                transition: 'background-color 0.2s ease'
              }}
            >
              Back to Courses
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
  // Tambah state untuk aktivitas user
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
        // Fetch user activities (endpoint baru)
        const actRes = await authAxios.get('/courses/admin/user-activities');
        setActivities(actRes.data.data); // [{_id, userName, userEmail, courseTitle, hoursSpent, lastAccess}]
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

  // Handler untuk update courses setelah tambah/edit
  const handleCoursesUpdated = async () => {
    await fetchCourses();
    setActiveTab('courses');
  };

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
      <div className="flex items-center space-x-3">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="text-lg font-medium text-slate-700">Loading admin panel...</span>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 max-w-md">
        <div className="flex items-center space-x-3">
          <div className="bg-red-100 rounded-full p-2">
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <span className="text-red-800 font-medium">{error}</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-4xl font-bold text-slate-800 mb-2">Admin Panel</h2>
          <p className="text-slate-600 text-lg">Manage your courses, users, and monitor activities</p>
        </div>

        {/* Success Alert */}
        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-xl p-4 flex items-center space-x-3 animate-fade-in">
            <div className="bg-green-100 rounded-full p-2">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span className="text-green-800 font-medium">{success}</span>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="bg-white rounded-xl shadow-sm p-2 mb-8 border border-slate-200">
          <div className="flex space-x-2">
            {[
              { id: 'courses', label: 'Courses', icon: '📚' },
              { id: 'users', label: 'Users', icon: '👥' },
              { id: 'add-course', label: 'Add Course', icon: '➕' },
              { id: 'activities', label: 'User Activities', icon: '📊' }
            ].map(tab => (
              <button
                key={tab.id}
                className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg transform scale-105'
                    : 'text-slate-600 hover:text-blue-600 hover:bg-blue-50'
                }`}
                onClick={() => setActiveTab(tab.id)}
              >
                <span className="text-lg">{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="tab-content">
          {activeTab === 'courses' && (
            <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6">
                <h3 className="text-2xl font-bold text-white">Manage Courses</h3>
                <p className="text-blue-100 mt-1">View and manage all courses in the system</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="text-left py-4 px-6 font-semibold text-slate-700">Title</th>
                      <th className="text-left py-4 px-6 font-semibold text-slate-700">Instructor</th>
                      <th className="text-left py-4 px-6 font-semibold text-slate-700">Pages</th>
                      <th className="text-left py-4 px-6 font-semibold text-slate-700">Enrolled Students</th>
                      <th className="text-left py-4 px-6 font-semibold text-slate-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {courses.map(course => (
                      <tr key={course._id} className="hover:bg-slate-50 transition-colors duration-150">
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
            <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6">
                <h3 className="text-2xl font-bold text-white">Manage Users</h3>
                <p className="text-blue-100 mt-1">View and manage all users in the system</p>
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
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="text-left py-4 px-6 font-semibold text-slate-700">Name</th>
                        <th className="text-left py-4 px-6 font-semibold text-slate-700">Email</th>
                        <th className="text-left py-4 px-6 font-semibold text-slate-700">Role</th>
                        <th className="text-left py-4 px-6 font-semibold text-slate-700">Enrolled Courses</th>
                        <th className="text-left py-4 px-6 font-semibold text-slate-700">Joined Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {users.map(user => (
                        <tr key={user._id} className="hover:bg-slate-50 transition-colors duration-150">
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
              )}
            </div>
          )}
          
          {activeTab === 'add-course' && (
            <CourseForm onSuccess={handleCoursesUpdated} />
          )}

          {activeTab === 'activities' && (
            <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6">
                <h3 className="text-2xl font-bold text-white">User Activities</h3>
                <p className="text-blue-100 mt-1">Monitor user progress and course activities</p>
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
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="text-left py-4 px-6 font-semibold text-slate-700">User</th>
                        <th className="text-left py-4 px-6 font-semibold text-slate-700">Course</th>
                        <th className="text-left py-4 px-6 font-semibold text-slate-700">Progress (%)</th>
                        <th className="text-left py-4 px-6 font-semibold text-slate-700">Completed</th>
                        <th className="text-left py-4 px-6 font-semibold text-slate-700">Last Access</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {activities.map(act => {
                        // Gunakan progressPercent dari backend jika ada, jika tidak hitung manual
                        const percent = typeof act.progressPercent === 'number'
                          ? act.progressPercent
                          : (act.totalPages && act.totalPages > 0 ? Math.round((act.currentPage / act.totalPages) * 100) : 0);
                        return (
                          <tr key={act._id} className="hover:bg-slate-50 transition-colors duration-150">
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
                                <div className="w-24 bg-slate-200 rounded-full h-2">
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
                                <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-sm font-medium">No</span>
                              )}
                            </td>
                            <td className="py-4 px-6 text-slate-600">
                              {act.lastAccess ? new Date(act.lastAccess).toLocaleString() : '-'}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
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
    <div className="flex items-center justify-center py-12">
      <div className="bg-white p-8 rounded-2xl shadow-lg">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="text-slate-800 mt-4 text-lg font-medium">Loading course data...</p>
      </div>
    </div>
  );

  return (
    <div className="py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-8 py-6">
            <h3 className="text-3xl font-bold text-white">
              {courseId ? 'Edit Course' : 'Add New Course'}
            </h3>
          </div>

          {/* Content */}
          <div className="p-8">
            {/* Alerts */}
            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl">
                <span className="font-medium">{error}</span>
              </div>
            )}
            {success && (
              <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-6 py-4 rounded-xl">
                <span className="font-medium">{success}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Info Section */}
              <div className="bg-blue-50 rounded-2xl p-6 border border-blue-100">
                <h4 className="text-xl font-semibold text-slate-800 mb-4">
                  Basic Information
                </h4>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="form-group">
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Course Title</label>
                    <input 
                      type="text" 
                      name="title" 
                      value={formData.title} 
                      onChange={handleChange} 
                      required 
                      className="w-full px-4 py-3 border border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
                      placeholder="Enter course title..."
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Instructor</label>
                    <input 
                      type="text" 
                      name="instructor" 
                      value={formData.instructor} 
                      onChange={handleChange} 
                      required 
                      className="w-full px-4 py-3 border border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
                      placeholder="Enter instructor name..."
                    />
                  </div>
                </div>

                <div className="form-group mt-6">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Description</label>
                  <textarea 
                    name="description" 
                    value={formData.description} 
                    onChange={handleChange} 
                    required 
                    rows="4"
                    className="w-full px-4 py-3 border border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white resize-none"
                    placeholder="Enter course description..."
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-6 mt-6">
                  <div className="form-group">
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Duration (hours)</label>
                    <input 
                      type="number" 
                      name="duration" 
                      value={formData.duration} 
                      onChange={handleChange} 
                      required 
                      min="1"
                      className="w-full px-4 py-3 border border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
                      placeholder="Enter duration..."
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Total Pages</label>
                    <input
                      type="number"
                      name="totalPages"
                      value={formData.totalPages}
                      min="1"
                      onChange={handleTotalPagesChange}
                      required
                      className="w-full px-4 py-3 border border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
                      placeholder="Number of pages..."
                    />
                  </div>
                </div>
              </div>

              {/* Course Content Section */}
              <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
                <h4 className="text-xl font-semibold text-slate-800 mb-4">
                  Course Content
                </h4>
                
                <div className="space-y-4">
                  {formData.pages.map((page, idx) => (
                    <div key={idx} className="bg-white rounded-xl p-4 border border-slate-200">
                      <label className="block text-sm font-semibold text-slate-700 mb-3">
                        Page {idx + 1} Content
                      </label>
                      <textarea
                        value={page}
                        onChange={e => handlePageChange(idx, e.target.value)}
                        required
                        rows="4"
                        className="w-full px-4 py-3 border border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white resize-none"
                        placeholder={`Enter content for page ${idx + 1}...`}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-blue-100">
                <button 
                  type="submit" 
                  className="flex-1 bg-gradient-to-r from-blue-600 to-blue-800 text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-lg hover:from-blue-700 hover:to-blue-900 transform hover:scale-105 transition-all duration-200"
                >
                  {courseId ? 'Update Course' : 'Create Course'}
                </button>
                {courseId && (
                  <button 
                    type="button" 
                    onClick={() => navigate('/admin')} 
                    className="flex-1 sm:flex-none bg-slate-200 text-slate-800 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-slate-300 transition-all duration-200"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
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
    <div className="min-h-screen bg-white">
      <CourseForm courseId={id} onSuccess={handleSuccess} />
    </div>
  );
};

// Main App Component
function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="app min-h-screen flex flex-col bg-white">
          <Navbar />
          <main className="main-content flex-1">
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
          <footer className="footer bg-slate-800 text-white py-6 px-4 text-center">
            <div className="max-w-6xl mx-auto">
              <p className="text-sm">
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