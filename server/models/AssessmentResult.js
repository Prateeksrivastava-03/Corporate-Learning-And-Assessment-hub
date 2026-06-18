const mongoose = require('mongoose');

// Assessment Result
const answerSchema = new mongoose.Schema({
  questionId: { type: mongoose.Schema.Types.ObjectId, required: true },
  selectedOption: { type: String, default: '' },
  isCorrect: { type: Boolean, default: false },
  pointsEarned: { type: Number, default: 0 },
});

const assessmentResultSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  assessment: { type: mongoose.Schema.Types.ObjectId, ref: 'Assessment', required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
  answers: [answerSchema],
  score: { type: Number, default: 0 },         // raw points
  percentage: { type: Number, default: 0 },
  passed: { type: Boolean, default: false },
  attemptNumber: { type: Number, default: 1 },
  timeTaken: { type: Number, default: 0 },      // seconds
  submittedAt: { type: Date, default: Date.now },
}, { timestamps: true });

const AssessmentResult = mongoose.model('AssessmentResult', assessmentResultSchema);

// Certificate
const certificateSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  certificateId: { type: String, unique: true },
  issuedAt: { type: Date, default: Date.now },
  score: { type: Number },
}, { timestamps: true });

const Certificate = mongoose.model('Certificate', certificateSchema);

module.exports = { AssessmentResult, Certificate };
