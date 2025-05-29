import React, { useState, useEffect, createContext, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useNavigate, useParams } from "react-router-dom";
import { Link } from 'react-router-dom';
import './index.css'; 
import axios from 'axios';

// Set base URL for API
const API_URL = 'http://localhost:3000/api';

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
    <div className="home-container">
      <h1>Welcome to E-Course Platform</h1>
      <p>Learn new skills with our comprehensive online courses</p>
      <Link to="/courses" className="btn btn-primary">Browse Courses</Link>
    </div>
  );

  return (
    <div className="home-container">
      <h1>Welcome, {currentUser.name}</h1>
      <p>Here are your enrolled courses:</p>
      {loading ? (
        <div className="loading">Loading your courses...</div>
      ) : error ? (
        <div className="alert alert-danger">{error}</div>
      ) : enrolledCourses.length === 0 ? (
        <div>You have not enrolled in any courses yet.</div>
      ) : (
        <div className="courses-grid">
          {enrolledCourses.map(course => {
            const prog = progresses[course._id];
            const isCompleted = prog && prog.isCompleted;
            return (
              <div key={course._id} className="course-card">
                <h3>{course.title}</h3>
                <p>{course.description}</p>
                <div className="course-details">
                  <span>Instructor: {course.instructor}</span>
                  <span>Duration: {course.duration} hours</span>
                </div>
                <div className="course-actions">
                  <Link to={`/courses/${course._id}`} className="btn btn-primary">View Details</Link>
                  {isCompleted && <span className="badge badge-success" style={{marginLeft:8}}>Completed</span>}
                  {currentUser.role === 'student' && (
                    <button onClick={() => unenrollCourse(course._id)} className="btn btn-danger" style={{marginLeft:8}}>Unenroll</button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
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
        <div className="form-group">
          <label>Role</label>
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            required
          >
            <option value="student">Student</option>
            <option value="admin">Admin</option>
          </select>
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

  if (loading) return <div className="loading">Loading courses...</div>;
  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <div className="courses-container">
      <h2>Available Courses</h2>
      <div className="courses-grid">
        {courses.map(course => {
          const userId = currentUser?.id || currentUser?._id;
          const enrolledStudents = Array.isArray(course.enrolledStudents) ? course.enrolledStudents : [];
          const isEnrolled = enrolledStudents.includes(userId);
          return (
            <div key={course._id} className="course-card">
              <h3>{course.title}</h3>
              <p>{course.description}</p>
              <div className="course-details">
                <span>Instructor: {course.instructor}</span>
                <span>Duration: {course.duration} hours</span>
              </div>
              <div className="course-actions">
                <Link 
                  to={isEnrolled ? `/courses/${course._id}` : '#'}
                  className={`btn btn-primary${!isEnrolled ? ' disabled' : ''}`}
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
                {currentUser && currentUser.role === 'student' && (
                  <>
                    <button 
                      onClick={() => enrollCourse(course._id)} 
                      className="btn btn-secondary"
                      disabled={isEnrolled}
                    >
                      {isEnrolled ? 'Enrolled' : 'Enroll'}
                    </button>
                    {isEnrolled && (
                      <button onClick={() => unenrollCourse(course._id)} className="btn btn-danger" style={{marginLeft:8}}>Unenroll</button>
                    )}
                  </>
                )}
                {currentUser && currentUser.role === 'admin' && (
                  <>
                    <button
                      className="btn btn-sm btn-warning"
                      style={{ marginLeft: 8 }}
                      onClick={() => navigate(`/admin/courses/edit/${course._id}`)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-sm btn-danger"
                      style={{ marginLeft: 8 }}
                      onClick={() => deleteCourse(course._id)}
                    >
                      Delete
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}
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

  // Simulasi konten per halaman
  const renderPageContent = () => {
    if (!course) return 'No content';
    if (Array.isArray(course.pages) && course.pages.length > 0) {
      return course.pages[currentPage - 1] || 'No content';
    }
    if (course.content && typeof course.content === 'string') {
      const perPage = Math.ceil((course.content.length || 1) / (totalPages || 1));
      return course.content.substring((currentPage - 1) * perPage, currentPage * perPage) || 'No content';
    }
    return 'No content';
  };

  // Progress bar presentase
  const progressPercent = Math.round((currentPage / (totalPages || 20)) * 100);

  if (loading) return <div className="loading">Loading course details...</div>;
  if (error) return <div className="alert alert-danger">{error}</div>;
  if (!course) return <div className="not-found">Course not found</div>;

  if (!isEnrolled && currentUser && currentUser.role === 'student') {
    return <div className="alert alert-warning" style={{margin:40}}>You are not enrolled in this course.</div>;
  }

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
          {renderPageContent()}
        </div>
        <div className="pagination-controls">
          <button onClick={handlePrevPage} disabled={currentPage === 1} className="btn btn-secondary">Prev</button>
          <span style={{ margin: '0 10px' }}>Page {currentPage} / {totalPages}</span>
          <button onClick={handleNextPage} className="btn btn-secondary">
            {currentPage === totalPages ? 'Restart' : 'Next'}
          </button>
        </div>
        <div className="progress-bar-container" style={{ marginTop: 10 }}>
          <div className="progress-bar" style={{ width: '100%', background: '#eee', height: 16, borderRadius: 8 }}>
            <div style={{ width: `${progressPercent}%`, background: '#007bff', height: '100%', borderRadius: 8 }}></div>
          </div>
          <div style={{ textAlign: 'right', fontSize: 12 }}>{progressPercent}% completed</div>
        </div>
      </div>
      {progress && (
        <div className="progress-section">
          <p>
            <strong>Progress:</strong> {progressPercent}%
          </p>
          {progressPercent === 100 && (
            <div className="badge badge-success" style={{marginTop:8}}>Course Completed! 🎉</div>
          )}
        </div>
      )}
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

  if (loading) return <div className="loading">Loading admin panel...</div>;
  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <div className="admin-panel">
      <h2>Admin Panel</h2>
      {success && <div className="alert alert-success">{success}</div>}
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
        <button 
          className={`tab-btn ${activeTab === 'activities' ? 'active' : ''}`}
          onClick={() => setActiveTab('activities')}
        >
          User Activities
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
                  <th>Pages</th>
                  <th>Enrolled Students</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {courses.map(course => (
                  <tr key={course._id}>
                    <td>{course.title}</td>
                    <td>{course.instructor}</td>
                    <td>{course.pages ? course.pages.length : course.totalPages || 1}</td>
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
            {usersError && <div className="alert alert-danger">{usersError}</div>}
            {!usersError && (
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
            )}
          </div>
        )}
        
        {activeTab === 'add-course' && (
          <CourseForm onSuccess={handleCoursesUpdated} />
        )}

        {activeTab === 'activities' && (
          <div className="activities-list">
            <h3>User Activities</h3>
            {activitiesError && <div className="alert alert-danger">{activitiesError}</div>}
            {!activitiesError && (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Course</th>
                    <th>Progress (%)</th>
                    <th>Completed</th>
                    <th>Last Access</th>
                  </tr>
                </thead>
                <tbody>
                  {activities.map(act => {
                    // Gunakan progressPercent dari backend jika ada, jika tidak hitung manual
                    const percent = typeof act.progressPercent === 'number'
                      ? act.progressPercent
                      : (act.totalPages && act.totalPages > 0 ? Math.round((act.currentPage / act.totalPages) * 100) : 0);
                    return (
                      <tr key={act._id}>
                        <td>{act.userName} ({act.userEmail})</td>
                        <td>{act.courseTitle}</td>
                        <td>{percent}%</td>
                        <td>{act.isCompleted || percent === 100 ? <span className="badge badge-success">Yes</span> : <span className="badge badge-secondary">No</span>}</td>
                        <td>{act.lastAccess ? new Date(act.lastAccess).toLocaleString() : '-'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        )}
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
        <div className="form-group">
          <label>Total Pages</label>
          <input
            type="number"
            name="totalPages"
            value={formData.totalPages}
            min="1"
            onChange={handleTotalPagesChange}
            required
          />
        </div>
        {formData.pages.map((page, idx) => (
          <div className="form-group" key={idx}>
            <label>Page {idx + 1} Content</label>
            <textarea
              value={page}
              onChange={e => handlePageChange(idx, e.target.value)}
              required
              rows="4"
            />
          </div>
        ))}
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
  const { id } = useParams();
  const navigate = useNavigate();
  // Gunakan handler untuk update courses setelah edit
  const handleSuccess = async () => {
    // Tidak perlu fetch di sini, karena akan redirect ke /admin yang sudah fetch
  };
  return <CourseForm courseId={id} onSuccess={handleSuccess} />;
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