const Progress = require('../models/Progress');
const { Certificate } = require('../models/AssessmentResult');
const { v4: uuidv4 } = require('uuid');

// ---- PROGRESS ----

// @GET /api/progress
exports.getMyProgress = async (req, res) => {
  try {
    const progress = await Progress.find({ user: req.user.id }).populate('course', 'title thumbnail category lessons');
    res.json({ success: true, progress });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// @GET /api/progress/:courseId
exports.getCourseProgress = async (req, res) => {
  try {
    const progress = await Progress.findOne({ user: req.user.id, course: req.params.courseId });
    if (!progress) return res.status(404).json({ success: false, message: 'Progress not found' });
    res.json({ success: true, progress });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// @PUT /api/progress/:courseId/lesson/:lessonId
exports.updateLessonProgress = async (req, res) => {
  try {
    const progress = await Progress.findOne({ user: req.user.id, course: req.params.courseId });
    if (!progress) return res.status(404).json({ success: false, message: 'Progress not found' });

    const lesson = progress.lessonsProgress.find(l => l.lessonId.toString() === req.params.lessonId);
    if (lesson && !lesson.completed) {
      lesson.completed = true;
      lesson.completedAt = new Date();
    }
    const completed = progress.lessonsProgress.filter(l => l.completed).length;
    progress.completionPercentage = Math.round((completed / progress.lessonsProgress.length) * 100);
    if (progress.completionPercentage === 100 && !progress.isCompleted) {
      progress.isCompleted = true;
      progress.completedAt = new Date();
    }
    progress.lastAccessedAt = new Date();
    if (req.body.timeSpent) progress.timeSpent += req.body.timeSpent;
    await progress.save();
    res.json({ success: true, progress });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// @GET /api/progress/all (admin/trainer)
exports.getAllProgress = async (req, res) => {
  try {
    const progress = await Progress.find({})
      .populate('user', 'name email department')
      .populate('course', 'title category');
    res.json({ success: true, progress });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// ---- CERTIFICATES ----

// @GET /api/certificates
exports.getMyCertificates = async (req, res) => {
  try {
    const certs = await Certificate.find({ user: req.user.id }).populate('course', 'title category instructor').sort('-issuedAt');
    res.json({ success: true, certificates: certs });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// @POST /api/certificates/issue
exports.issueCertificate = async (req, res) => {
  try {
    const { userId, courseId, score } = req.body;
    const exists = await Certificate.findOne({ user: userId, course: courseId });
    if (exists) return res.status(400).json({ success: false, message: 'Certificate already issued' });
    const cert = await Certificate.create({ user: userId, course: courseId, score, certificateId: `CERT-${uuidv4().slice(0, 8).toUpperCase()}` });
    res.status(201).json({ success: true, certificate: cert });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// @GET /api/certificates/all (admin)
exports.getAllCertificates = async (req, res) => {
  try {
    const certs = await Certificate.find({}).populate('user', 'name email department').populate('course', 'title category').sort('-issuedAt');
    res.json({ success: true, certificates: certs });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};
