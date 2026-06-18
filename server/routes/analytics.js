const express = require('express');
const router = express.Router();
const { getOverview, getUserAnalytics, getCourseAnalytics, getAssessmentAnalytics } = require('../controllers/analyticsController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect, authorize('admin', 'trainer'));
router.get('/overview', getOverview);
router.get('/users', getUserAnalytics);
router.get('/courses', getCourseAnalytics);
router.get('/assessments', getAssessmentAnalytics);

module.exports = router;
