const mongoose = require('mongoose');

const optionSchema = new mongoose.Schema({
  text: { type: String, required: true },
  isCorrect: { type: Boolean, default: false },
});

const questionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  type: { type: String, enum: ['mcq', 'true_false', 'short_answer'], default: 'mcq' },
  options: [optionSchema],
  correctAnswer: { type: String, default: '' }, // for short_answer
  points: { type: Number, default: 1 },
  explanation: { type: String, default: '' },
});

const assessmentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  questions: [questionSchema],
  timeLimit: { type: Number, default: 30 }, // minutes
  passingScore: { type: Number, default: 70 }, // percentage
  maxAttempts: { type: Number, default: 3 },
  isPublished: { type: Boolean, default: false },
  shuffleQuestions: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Assessment', assessmentSchema);
