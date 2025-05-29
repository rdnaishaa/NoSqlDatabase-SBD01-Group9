const mongoose = require("mongoose");

const CourseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Please add a course title"],
    trim: true,
    maxlength: [100, "Title cannot be more than 100 characters"],
  },
  description: {
    type: String,
    required: [true, "Please add a description"],
  },
  pages: {
    type: [String],
    required: false,
    default: []
  },
  totalPages: {
    type: Number,
    required: false,
    default: 1
  },
  instructor: {
    type: String,
    required: [true, "Please add an instructor name"],
  },
  duration: {
    type: Number,
    required: [true, "Please add course duration in hours"],
  },
  enrolledStudents: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Course", CourseSchema);
