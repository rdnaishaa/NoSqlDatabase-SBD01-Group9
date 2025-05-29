const mongoose = require('mongoose');

const ProgressSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  hoursSpent: { type: Number, default: 0 },
  lastAccess: { type: Date, default: null },
  currentPage: { type: Number, default: 1 }, // halaman terakhir yang dilihat
  totalPages: { type: Number, default: 1 }   // total halaman course (sync dengan course)
}, { timestamps: true });

// Virtual: apakah course sudah completed (berdasarkan halaman)
ProgressSchema.virtual('isCompleted').get(function() {
  // Completed hanya jika currentPage >= totalPages dan totalPages > 0
  return this.totalPages > 0 && this.currentPage >= this.totalPages;
});

// Virtual: progress percent (0-100)
ProgressSchema.virtual('progressPercent').get(function() {
  return this.totalPages > 0 ? Math.round((this.currentPage / this.totalPages) * 100) : 0;
});

ProgressSchema.index({ user: 1, course: 1 }, { unique: true });

module.exports = mongoose.model('Progress', ProgressSchema);