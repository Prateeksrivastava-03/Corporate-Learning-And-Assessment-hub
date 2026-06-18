const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, default: '' },
  videoUrl: { type: String, default: '' },
  duration: { type: Number, default: 0 }, // minutes
  order: { type: Number, required: true },
});

const courseSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  thumbnail: { type: String, default: '' },
  link: { type: String, default: '' },
  videoFile: { type: String, default: '' },
  level: { type: String, enum: ['beginner', 'intermediate', 'advanced'], default: 'beginner' },
  duration: { type: Number, default: 0 }, // total minutes
  instructor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  lessons: [lessonSchema],
  enrolledStudents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  isPublished: { type: Boolean, default: false },
  tags: [{ type: String }],
  passingScore: { type: Number, default: 70 },
}, { timestamps: true });

module.exports = mongoose.model('Course', courseSchema);
