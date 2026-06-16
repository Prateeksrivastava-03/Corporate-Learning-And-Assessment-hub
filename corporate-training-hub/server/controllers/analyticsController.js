const User = require('../models/User');
const Course = require('../models/Course');
const Assessment = require('../models/Assessment');
const Progress = require('../models/Progress');
const { AssessmentResult, Certificate } = require('../models/AssessmentResult');

// @GET /api/analytics/overview
exports.getOverview = async (req, res) => {
  try {
    const [totalUsers, totalCourses, totalAssessments, totalCertificates, completedCourses, passedAssessments] = await Promise.all([
      User.countDocuments(),
      Course.countDocuments({ isPublished: true }),
      Assessment.countDocuments({ isPublished: true }),
      Certificate.countDocuments(),
      Progress.countDocuments({ isCompleted: true }),
      AssessmentResult.countDocuments({ passed: true }),
    ]);

    const recentActivity = await AssessmentResult.find({}).populate('user', 'name').populate('assessment', 'title').sort('-submittedAt').limit(10);
    const topCourses = await Course.find({ isPublished: true }).sort('-enrolledStudents').limit(5).select('title enrolledStudents category');

    res.json({
      success: true,
      stats: { totalUsers, totalCourses, totalAssessments, totalCertificates, completedCourses, passedAssessments },
      recentActivity,
      topCourses,
    });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// @GET /api/analytics/users
exports.getUserAnalytics = async (req, res) => {
  try {
    const usersByRole = await User.aggregate([{ $group: { _id: '$role', count: { $sum: 1 } } }]);
    const usersByDept = await User.aggregate([{ $group: { _id: '$department', count: { $sum: 1 } } }]);
    const newUsersPerMonth = await User.aggregate([
      { $group: { _id: { month: { $month: '$createdAt' }, year: { $year: '$createdAt' } }, count: { $sum: 1 } } },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      { $limit: 12 }
    ]);
    res.json({ success: true, usersByRole, usersByDept, newUsersPerMonth });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// @GET /api/analytics/courses
exports.getCourseAnalytics = async (req, res) => {
  try {
    const enrollmentData = await Course.aggregate([
      { $project: { title: 1, enrolledCount: { $size: '$enrolledStudents' }, category: 1 } },
      { $sort: { enrolledCount: -1 } }
    ]);
    const completionData = await Progress.aggregate([
      { $group: { _id: '$course', avgCompletion: { $avg: '$completionPercentage' }, completed: { $sum: { $cond: ['$isCompleted', 1, 0] } }, total: { $sum: 1 } } },
    ]);
    res.json({ success: true, enrollmentData, completionData });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// @GET /api/analytics/assessments
exports.getAssessmentAnalytics = async (req, res) => {
  try {
    const results = await AssessmentResult.aggregate([
      { $group: { _id: '$assessment', avgScore: { $avg: '$percentage' }, passRate: { $avg: { $cond: ['$passed', 1, 0] } }, attempts: { $sum: 1 } } },
    ]);
    const scoreDistribution = await AssessmentResult.aggregate([
      { $bucket: { groupBy: '$percentage', boundaries: [0, 20, 40, 60, 80, 100], default: '100+', output: { count: { $sum: 1 } } } }
    ]);
    res.json({ success: true, results, scoreDistribution });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};
