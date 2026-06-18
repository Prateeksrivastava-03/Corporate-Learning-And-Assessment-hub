const express = require('express');
const router = express.Router();
const { getMyProgress, getCourseProgress, updateLessonProgress, getAllProgress } = require('../controllers/progressController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.get('/', getMyProgress);
router.get('/all', authorize('admin', 'trainer'), getAllProgress);
router.get('/:courseId', getCourseProgress);
router.put('/:courseId/lesson/:lessonId', updateLessonProgress);

module.exports = router;
