# 🚀 E-Course Platform - Advanced Online Learning Management System

### *Revolutionizing Digital Education Through Modern Technology*

---

## 📖 Platform Overview

**E-Course Platform** a comprehensive Full Stack MERN (MongoDB, Express.js, React, Node.js) application designed to deliver an exceptional online learning experience. This platform empowers students to effortlessly enroll in courses, track their learning progress in real-time, and resume their studies anytime. For administrators, it offers a powerful dashboard to manage courses, monitor student enrollment, and gain valuable insights into user activity and completion rates. Built for scalability and ease of use, it's the perfect foundation for any digital education initiative.

---

## 👨‍💻 Meet our team!

Our diverse team of skilled developers brings together expertise in full-stack development, user experience design, and educational technology:

| ![Pavel](https://img.freepik.com/free-psd/3d-render-avatar-character_23-2150611731.jpg?ga=GA1.1.472862580.1745298170&semt=ais_items_boosted&w=740) | ![Nabiel](https://img.freepik.com/free-psd/3d-illustration-human-avatar-profile_23-2150671145.jpg?ga=GA1.1.472862580.1745298170&w=740) | ![Zahra](https://img.freepik.com/free-psd/3d-illustration-human-avatar-profile_23-2150671136.jpg?ga=GA1.1.1916796990.1746620138&w=740) | ![Ica](https://img.freepik.com/free-psd/3d-illustration-human-avatar-profile_23-2150671118.jpg?ga=GA1.1.1916796990.1746620138&w=740) |
|:---:|:---:|:---:|:---:|
|**Fullstack Developer** | **Fullstack Developer** | **Fullstack Developer** | **Fullstack Developer** |
| Muhammad Pavel | Nabiel Harits Utomo | Zhafira Zahra Alfarisy | R. Aisha Syauqi Ramadhani |

---

## 🎯 Our Features

### 1.  **Dual Role System**
* **Student Role**: Can browse courses, enroll, unenroll, and track their personal progress.
* **Admin Role**: Has full CRUD (Create, Read, Update, Delete) access over courses, can view all users, and monitor all student activities across the platform.

-----

### 2.  **Seamless Authentication**
* Secure user registration and login system using JSON Web Tokens (JWT) for session management.
* Protected routes ensure that users can only access content appropriate for their role.

-----

### 3.  **Comprehensive Course Management (Admin)**
* Create, update, and delete courses with details like title, description, instructor, and duration.
* Full visibility into which students are enrolled in each course.

-----

### 4.  **Detailed Progress Tracking**
* Students' progress is automatically tracked, including hours spent and the last page visited.
* Virtual properties in the database automatically calculate completion percentage (`progressPercent`) and status (`isCompleted`).

-----

### 5.  **Student Enrollment System**
* Students can easily enroll in and unenroll from courses with a single click.
* The system seamlessly links users, courses, and their progress records.

-----

### 6.  **Admin Dashboard Insights**
* A dedicated endpoint for admins to fetch all user activities, providing a holistic view of platform engagement.

---

## 📂 Project Structure
Our platform follows a standard MERN stack architecture, separating the frontend and backend concerns.

```
NOSQLDATABASE-SBD01_GROUP9/
├── my-project/               # Frontend Application (Client)
│   ├── public/
│   │   └── vite.svg
│   ├── src/
│   │   ├── assets/
│   │   ├── App.css
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── .gitignore
│   ├── eslint.config.js
│   ├── index.html
│   ├── package-lock.json
│   ├── package.json
│   ├── postcss.config.js
│   ├── README.md
│   ├── tailwind.config.js
│   └── vite.config.js
├── src/                      # Backend Application (Server)
│   ├── controller/           # Handles incoming request logic
│   │   ├── authController.js
│   │   ├── courseController.js
│   │   └── userController.js
│   ├── database/             # Manages database connection and models
│   │   ├── models/
│   │   │   ├── Course.js
│   │   │   ├── Progress.js
│   │   │   └── User.js
│   │   └── connection.js
│   ├── middleware/           # Contains middleware functions (e.g., auth)
│   │   ├── auth.js
│   │   └── authorize.js
│   ├── repository/           # Handles database query logic
│   │   ├── courseRepository.js
│   │   └── userRepository.js
│   ├── route/                # Defines API endpoints
│   │   ├── authRoutes.js
│   │   ├── courseRoutes.js
│   │   └── userRoutes.js
│   └── util/                 # Utility functions (e.g., response formatting)
│       └── response.js
├── .env
├── .gitignore
├── Dockerfile
├── index.js              # Main server entry point
├── package-lock.json
├── package.json
├── README.md
└── vercel.json
```

---

## 🛠️ Getting Started

[![Node.js](https://img.shields.io/badge/Node.js->=18-success?logo=node.js&logoColor=white)](https://nodejs.org)
[![MongoDB](https://img.shields.io/badge/MongoDB->=5.0-success?logo=mongodb&logoColor=white)](https://www.mongodb.com)
[![npm](https://img.shields.io/badge/npm->=8-red?logo=npm&logoColor=white)](https://www.npmjs.com)

### 📋 Prerequisites
- **Node.js** (version 18.0 or higher)
- **npm** or **yarn** package manager
- **MongoDB** (local installation or cloud service like MongoDB Atlas)
- **Docker** (optional, for containerized deployment)

### Installation Process

**1. Repository Setup**
```bash
git clone https://github.com/rdnaishaa/NoSqlDatabase-SBD01-Group9.git
cd NoSqlDatabase-SBD01-Group9
```

**2. Backend Configuration**
```bash
cd src
npm install
```

Configure your environment by creating a `.env` file in the `src/` directory. Reference the [Environment Configuration](#.env) section for required variables.

**3. Frontend Setup**
```bash
cd ../my-project
npm install
```

Create a `.env` file in the `my-project/` directory with your backend API endpoint:
```bash
VITE_API_BASE_URL=http://localhost:5000/api
```

### Application Launch

**Backend Server:**
```bash
cd src
npm run dev          # Development mode with auto-reload
# or
npm start           # Production mode
```

**Frontend Development Server:**
```bash
cd my-project
npm run dev
```

Access the application at `http://localhost:5173` (frontend) with API services running on `http://localhost:5000`.

---

## 📱 User Interface Showcase

### **Landing Page**
* A view of the landing page before login
![picture 260](https://i.imgur.com/eZHAaof.png)  

### **Login and Register**
* A view of the Login and Register page

| Login | Register |
|:-----:|:-------:|
| ![picture 261](https://i.imgur.com/ZKRKgMQ.png) | ![picture 262](https://i.imgur.com/bkT7hR2.png) |


### **Student Dashboard View**

  * A view of the main dashboard where students can see their enrolled courses and a summary of their progress.
  ![picture 264](https://i.imgur.com/ydje58A.png)  



### **Course Catalog View**

  * The page where students can browse all available courses and enroll with one click.
  
    - **Admins Preview**
    ![picture 258](https://i.imgur.com/pZ0XtQg.png)  

    - **Students Preview**
    ![picture 265](https://i.imgur.com/ns0Zlew.png)  


### **Course Completion**
  * This page shows the course details of the general description, instructor, duration, and created at. Also can track students progress.
  ![picture 266](https://i.imgur.com/X77pNfh.png)  


### **Admin Dashboard View**

  * The admin-exclusive view showing lists of all users, all courses, and user activity logs.

    - **Manage Courses**
    ![picture 254](https://i.imgur.com/A9JCO37.png)  

    - **Manage Users**
    ![picture 255](https://i.imgur.com/UY1d2z5.png)  

    - **Add Course**
    
      ![picture 256](https://i.imgur.com/9Tz464G.png)  

    - **User Activities**
    ![picture 259](https://i.imgur.com/VsEj7en.png)  


---

## 🗄️ Database Design

Our database is designed with three core Mongoose models to manage users, courses, and their interactions.

1.  #### User (`User.js`)
    Manages user accounts, authentication details, and a list of courses they are enrolled in. The user's role (`student` or `admin`) dictates their permissions.
    ```javascript
    const UserSchema = new mongoose.Schema({
      name: { type: String, required: true },
      email: { type: String, required: true, unique: true },
      password: { type: String, required: true, minlength: 6, select: false },
      role: { type: String, enum: ['student', 'admin'], default: 'student' },
      enrolledCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }]
    });
    ```

-----

2.  #### Course (`Course.js`)
    Represents an individual course, containing all its metadata and a list of enrolled students.
    ```javascript
    const CourseSchema = new mongoose.Schema({
      title: { type: String, required: true, trim: true },
      description: { type: String, required: true },
      pages: { type: [String], default: [] },
      totalPages: { type: Number, default: 1 },
      instructor: { type: String, required: true },
      duration: { type: Number, required: true }, // in hours
      enrolledStudents: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }]
    });
    ```

-----

3.  #### Progress (`Progress.js`)
    A crucial model that links a specific user to a specific course to track their learning progress.
    ```javascript
    const ProgressSchema = new mongoose.Schema({
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
      course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
      hoursSpent: { type: Number, default: 0 },
      lastAccess: { type: Date, default: null },
      currentPage: { type: Number, default: 1 },
      totalPages: { type: Number, default: 1 }
    });

    // Virtuals for calculated fields
    ProgressSchema.virtual('isCompleted').get(...);
    ProgressSchema.virtual('progressPercent').get(...);
    ```

---

## 🔌 API Reference

The backend exposes a RESTful API with role-based access control.

### 🔐 Auth Routes (`/api/auth`)

  * `POST /register` — Register a new user (public).
  * `POST /login` — Log in an existing user and receive a JWT (public).
  * `GET /me` — Get the profile of the currently logged-in user (protected).

### 👥 User Routes (`/api/users`)

  * `GET /` — Get a list of all users (protected, admin only).
  * `POST /enroll/:courseId` — Enroll the current user in a course (protected, student only).

### 📚 Course Routes (`/api/courses`)

  * `GET /` — Get a list of all available courses (protected).
  * `POST /` — Create a new course (protected, admin only).
  * `GET /:id` — Get details of a single course (protected).
  * `PUT /:id` — Update a course's details (protected, admin only).
  * `DELETE /:id` — Delete a course (protected, admin only).
  * `POST /:id/unenroll` — Unenroll the current user from a course (protected).
  * `GET /progress/:courseId` — Get the current user's progress for a specific course (protected).
  * `POST /progress/:courseId/add-hour` — Log an additional hour of study for a course (protected).
  * `POST /progress/:courseId/page` — Update the last page visited by the user in a course (protected).
  * `GET /admin/user-activities` — Get a log of all user activities on the platform (protected, admin only).

---

## ⚙️ Environment Configuration

Create a `.env` file in the `src/` directory with these essential variables:

```bash
# Server Configuration
PORT=5000
NODE_ENV=development
API_VERSION=v1

# Database Connection
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ecourse?retryWrites=true&w=majority

# Authentication Security
JWT_SECRET=your-super-secure-jwt-secret-key-minimum-32-characters
JWT_EXPIRATION=30d
BCRYPT_ROUNDS=12

# Application Settings
CORS_ORIGIN=http://localhost:5173
MAX_ENROLLMENT_PER_USER=50

# Optional: Email Configuration (for future features)
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

**Security Note:** Always generate a cryptographically strong `JWT_SECRET` for production deployments.

---

## 🐳 Containerization & Deployment

Deploy the backend using our optimized Docker configuration:

```dockerfile
FROM node:22
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY src/.env .env
COPY . .

ENV NODE_ENV=production
EXPOSE 5000
# CMD ["node", "index.js"]
CMD ["npm", "start"]
```

## Setup Instructions

Ensure to prepare your .env file in the root directory of the project, use this for the following content:

```env
MONGODB_URI={your_mongodb_uri}
PORT=5000
```

Follow these steps to set up the project, this project is built using Docker so that you need to have Docker installed on your machine. :

```bash
git clone https://github.com/rdnaishaa/NoSqlDatabase-SBD01-Group9.git
docker-compose up -d --build
```
---


## 📄 Acknowledgments

### **Built With**
- **Frontend:** React.js, Vite, Tailwind CSS
- **Backend:** Node.js, Express.js, MongoDB
- **Authentication:** JSON Web Tokens (JWT)
- **Deployment:** Docker, Vercel

---

<div align="center">

**🌟 Crafted with passion by Kelompok 9 - Sistem Basis Data 01 🌟**

*Empowering education through innovative technology*

[![GitHub stars](https://img.shields.io/github/stars/your-repo/ecourse-platform.svg?style=social&label=Star)](https://github.com/rdnaishaa/NoSqlDatabase-SBD01-Group9.git)

</div>
