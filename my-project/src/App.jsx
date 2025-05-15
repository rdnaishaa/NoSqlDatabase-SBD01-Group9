import React, { useState, useEffect, createContext, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useNavigate } from "react-router-dom";
import { Link } from 'react-router-dom';
import './index.css'; 
import axios from 'axios';

// Set base URL for API
const API_URL = 'http://localhost:5000';

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
    const res = await axios.post(`${API_URL}/login`, { email, password });
    localStorage.setItem('token', res.data.token);
    setCurrentUser(res.data.user);
    return res.data.user;
  };

  const register = async (userData) => {
    const res = await axios.post(`${API_URL}/register`, userData);
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

  if (!currentUser || currentUser.role !== 'admin') {
    return <Navigate to="/" />;
  }

  return children;
};

// Components
const Navbar = () => {
  const { currentUser, logout } = React.useContext(AuthContext);

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/">E-Course Platform</Link>
      </div>
      <div className="navbar-menu">
        <Link to="/courses">Courses</Link>
        {currentUser && currentUser.role === 'admin' && (
          <Link to="/admin">Admin Panel</Link>
        )}
        {currentUser ? (
          <>
            <span className="user-welcome">Welcome, {currentUser.name}</span>
            <button onClick={logout} className="btn btn-danger">Logout</button>
          </>
        ) : (
          <>
            <Link to="/login" className="btn btn-primary">Login</Link>
            <Link to="/register" className="btn btn-secondary">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
};

// Home Page
const Home = () => {
  return (
    <div className="home-container">
      <h1>Welcome to E-Course Platform</h1>
      <p>Learn new skills with our comprehensive online courses</p>
      <Link to="/courses" className="btn btn-primary">Browse Courses</Link>
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
    <div className="auth-container">
      <h2>Login</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Email</label>
          <input 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required 
          />
        </div>
        <div className="form-group">
          <label>Password</label>
          <input 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
          />
        </div>
        <button type="submit" className="btn btn-primary">Login</button>
      </form>
      <p>
        Don't have an account? <Link to="/register">Register</Link>
      </p>
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
 const navigate = useNavigate()

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
    <div className="auth-container">
      <h2>Register</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Name</label>
          <input 
            type="text" 
            name="name" 
            value={formData.name} 
            onChange={handleChange} 
            required 
          />
        </div>
        <div className="form-group">
          <label>Email</label>
          <input 
            type="email" 
            name="email" 
            value={formData.email} 
            onChange={handleChange} 
            required 
          />
        </div>
        <div className="form-group">
          <label>Password</label>
          <input 
            type="password" 
            name="password" 
            value={formData.password} 
            onChange={handleChange} 
            required 
            minLength="6"
          />
        </div>
        <button type="submit" className="btn btn-primary">Register</button>
      </form>
      <p>
        Already have an account? <Link to="/login">Login</Link>
      </p>
    </div>
  );
};

// Courses List Page
const CoursesList = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { currentUser } = React.useContext(AuthContext);

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
      await authAxios.post(`/courses/${courseId}/enroll`);
      // Refresh courses
      const res = await authAxios.get('/courses');
      setCourses(res.data.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to enroll');
    }
  };

  if (loading) return <div className="loading">Loading courses...</div>;
  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <div className="courses-container">
      <h2>Available Courses</h2>
      <div className="courses-grid">
        {courses.map(course => (
          <div key={course._id} className="course-card">
            <h3>{course.title}</h3>
            <p>{course.description}</p>
            <div className="course-details">
              <span>Instructor: {course.instructor}</span>
              <span>Duration: {course.duration} hours</span>
            </div>
            <div className="course-actions">
              <Link to={`/courses/${course._id}`} className="btn btn-primary">View Details</Link>
              {currentUser && currentUser.role === 'student' && (
                <button 
                  onClick={() => enrollCourse(course._id)} 
                  className="btn btn-secondary"
                  disabled={course.enrolledStudents.includes(currentUser.id)}
                >
                  {course.enrolledStudents.includes(currentUser.id) ? 'Enrolled' : 'Enroll'}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Course Detail Page
const CourseDetail = () => {
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { id } = React.useParams();

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const res = await authAxios.get(`/courses/${id}`);
        setCourse(res.data.data);
      } catch (err) {
        setError('Failed to load course details');
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [id]);

  if (loading) return <div className="loading">Loading course details...</div>;
  if (error) return <div className="alert alert-danger">{error}</div>;
  if (!course) return <div className="not-found">Course not found</div>;

  return (
    <div className="course-detail">
      <h2>{course.title}</h2>
      <div className="course-info">
        <p><strong>Instructor:</strong> {course.instructor}</p>
        <p><strong>Duration:</strong> {course.duration} hours</p>
        <p><strong>Created:</strong> {new Date(course.createdAt).toLocaleDateString()}</p>
      </div>
      <div className="course-description">
        <h3>Description</h3>
        <p>{course.description}</p>
      </div>
      <div className="course-content">
        <h3>Course Content</h3>
        <div className="content-preview">
          {course.content}
        </div>
      </div>
      <Link to="/courses" className="btn btn-secondary">Back to Courses</Link>
    </div>
  );
};

// Admin Panel
const AdminPanel = () => {
  const [courses, setCourses] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('courses');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [coursesRes, usersRes] = await Promise.all([
          authAxios.get('/courses'),
          authAxios.get('/users')
        ]);
        setCourses(coursesRes.data.data);
        setUsers(usersRes.data.data);
      } catch (err) {
        setError('Failed to load admin data');
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
      } catch (err) {
        setError('Failed to delete course');
      }
    }
  };

  if (loading) return <div className="loading">Loading admin panel...</div>;
  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <div className="admin-panel">
      <h2>Admin Panel</h2>
      
      <div className="admin-tabs">
        <button 
          className={`tab-btn ${activeTab === 'courses' ? 'active' : ''}`}
          onClick={() => setActiveTab('courses')}
        >
          Courses
        </button>
        <button 
          className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          Users
        </button>
        <button 
          className={`tab-btn ${activeTab === 'add-course' ? 'active' : ''}`}
          onClick={() => setActiveTab('add-course')}
        >
          Add Course
        </button>
      </div>
      
      <div className="tab-content">
        {activeTab === 'courses' && (
          <div className="courses-list">
            <h3>Manage Courses</h3>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Instructor</th>
                  <th>Duration</th>
                  <th>Enrolled Students</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {courses.map(course => (
                  <tr key={course._id}>
                    <td>{course.title}</td>
                    <td>{course.instructor}</td>
                    <td>{course.duration} hours</td>
                    <td>{course.enrolledStudents.length}</td>
                    <td>
                      <Link to={`/admin/courses/edit/${course._id}`} className="btn btn-sm btn-primary">Edit</Link>
                      <button 
                        onClick={() => deleteCourse(course._id)} 
                        className="btn btn-sm btn-danger"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        {activeTab === 'users' && (
          <div className="users-list">
            <h3>Manage Users</h3>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Enrolled Courses</th>
                  <th>Joined Date</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user._id}>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>{user.role}</td>
                    <td>{user.enrolledCourses.length}</td>
                    <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        {activeTab === 'add-course' && <CourseForm />}
      </div>
    </div>
  );
};

// Course Form Component (used for both Add and Edit)
const CourseForm = ({ courseId }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content: '',
    instructor: '',
    duration: ''
  });
  const [loading, setLoading] = useState(courseId ? true : false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = React.useNavigate();

  useEffect(() => {
    const fetchCourse = async () => {
      if (courseId) {
        try {
          const res = await authAxios.get(`/courses/${courseId}`);
          setFormData(res.data.data);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    try {
      // Convert duration to number
      const data = {
        ...formData,
        duration: Number(formData.duration)
      };
      
      if (courseId) {
        await authAxios.put(`/courses/${courseId}`, data);
        setSuccess('Course updated successfully');
      } else {
        await authAxios.post('/courses', data);
        setSuccess('Course created successfully');
        setFormData({
          title: '',
          description: '',
          content: '',
          instructor: '',
          duration: ''
        });
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save course');
    }
  };

  if (loading) return <div className="loading">Loading course data...</div>;

  return (
    <div className="course-form">
      <h3>{courseId ? 'Edit Course' : 'Add New Course'}</h3>
      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Title</label>
          <input 
            type="text" 
            name="title" 
            value={formData.title} 
            onChange={handleChange} 
            required 
          />
        </div>
        <div className="form-group">
          <label>Description</label>
          <textarea 
            name="description" 
            value={formData.description} 
            onChange={handleChange} 
            required 
          />
        </div>
        <div className="form-group">
          <label>Content</label>
          <textarea 
            name="content" 
            value={formData.content} 
            onChange={handleChange} 
            required 
            rows="10"
          />
        </div>
        <div className="form-group">
          <label>Instructor</label>
          <input 
            type="text" 
            name="instructor" 
            value={formData.instructor} 
            onChange={handleChange} 
            required 
          />
        </div>
        <div className="form-group">
          <label>Duration (hours)</label>
          <input 
            type="number" 
            name="duration" 
            value={formData.duration} 
            onChange={handleChange} 
            required 
            min="1"
          />
        </div>
        <div className="form-actions">
          <button type="submit" className="btn btn-primary">
            {courseId ? 'Update Course' : 'Create Course'}
          </button>
          {courseId && (
            <button 
              type="button" 
              onClick={() => navigate('/admin')} 
              className="btn btn-secondary"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

// Edit Course Page
const EditCourse = () => {
  const { id } = React.useParams();
  return <CourseForm courseId={id} />;
};

// Main App Component
function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="app">
          <Navbar />
          <main className="main-content">
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
          <footer className="footer">
            <p>&copy; {new Date().getFullYear()} E-Course Platform. All rights reserved.</p>
          </footer>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;