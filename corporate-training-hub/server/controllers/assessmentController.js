const Assessment = require('../models/Assessment');
const { AssessmentResult } = require('../models/AssessmentResult');

// @GET /api/assessments
exports.getAssessments = async (req, res) => {
  try {
    const filter = req.user.role === 'employee' ? { isPublished: true } : {};
    const assessments = await Assessment.find(filter).populate('createdBy', 'name').populate('course', 'title').sort('-createdAt');
    res.json({ success: true, count: assessments.length, assessments });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// @GET /api/assessments/:id
exports.getAssessment = async (req, res) => {
  try {
    const assessment = await Assessment.findById(req.params.id).populate('createdBy', 'name').populate('course', 'title');
    if (!assessment) return res.status(404).json({ success: false, message: 'Assessment not found' });
    // Hide correct answers for employees
    if (req.user.role === 'employee') {
      const safe = assessment.toObject();
      safe.questions = safe.questions.map(q => ({ ...q, options: q.options.map(o => ({ ...o, isCorrect: undefined })), correctAnswer: undefined }));
      return res.json({ success: true, assessment: safe });
    }
    res.json({ success: true, assessment });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// @POST /api/assessments
exports.createAssessment = async (req, res) => {
  try {
    const assessment = await Assessment.create({ ...req.body, createdBy: req.user.id });
    res.status(201).json({ success: true, assessment });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// @PUT /api/assessments/:id
exports.updateAssessment = async (req, res) => {
  try {
    const assessment = await Assessment.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!assessment) return res.status(404).json({ success: false, message: 'Assessment not found' });
    res.json({ success: true, assessment });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// @DELETE /api/assessments/:id
exports.deleteAssessment = async (req, res) => {
  try {
    await Assessment.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Assessment deleted' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// @POST /api/assessments/:id/submit
exports.submitAssessment = async (req, res) => {
  try {
    const assessment = await Assessment.findById(req.params.id);
    if (!assessment) return res.status(404).json({ success: false, message: 'Assessment not found' });

    const { answers, timeTaken } = req.body;
    const prevAttempts = await AssessmentResult.countDocuments({ user: req.user.id, assessment: assessment._id });
    if (prevAttempts >= assessment.maxAttempts) {
      return res.status(400).json({ success: false, message: 'Max attempts reached' });
    }

    let totalPoints = 0, earnedPoints = 0;
    const processedAnswers = assessment.questions.map(q => {
      totalPoints += q.points;
      const userAnswer = answers.find(a => a.questionId === q._id.toString());
      let isCorrect = false;
      let pointsEarned = 0;
      if (userAnswer) {
        if (q.type === 'mcq' || q.type === 'true_false') {
          const correct = q.options.find(o => o.isCorrect);
          isCorrect = correct && correct.text === userAnswer.selectedOption;
        } else {
          isCorrect = q.correctAnswer?.toLowerCase() === userAnswer.selectedOption?.toLowerCase();
        }
        if (isCorrect) { pointsEarned = q.points; earnedPoints += q.points; }
      }
      return { questionId: q._id, selectedOption: userAnswer?.selectedOption || '', isCorrect, pointsEarned };
    });

    const percentage = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;
    const passed = percentage >= assessment.passingScore;

    const result = await AssessmentResult.create({
      user: req.user.id,
      assessment: assessment._id,
      course: assessment.course,
      answers: processedAnswers,
      score: earnedPoints,
      percentage,
      passed,
      attemptNumber: prevAttempts + 1,
      timeTaken,
    });

    res.json({ success: true, result: { score: earnedPoints, totalPoints, percentage, passed, attemptNumber: prevAttempts + 1 } });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// @GET /api/assessments/:id/results
exports.getResults = async (req, res) => {
  try {
    const filter = req.user.role === 'employee'
      ? { assessment: req.params.id, user: req.user.id }
      : { assessment: req.params.id };
    const results = await AssessmentResult.find(filter).populate('user', 'name email department').sort('-submittedAt');
    res.json({ success: true, results });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};
