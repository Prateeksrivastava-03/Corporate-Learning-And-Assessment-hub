const express = require('express');
const router = express.Router();
const { getAssessments, getAssessment, createAssessment, updateAssessment, deleteAssessment, submitAssessment, getResults } = require('../controllers/assessmentController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.get('/', getAssessments);
router.get('/:id', getAssessment);
router.post('/', authorize('admin', 'trainer'), createAssessment);
router.put('/:id', authorize('admin', 'trainer'), updateAssessment);
router.delete('/:id', authorize('admin', 'trainer'), deleteAssessment);
router.post('/:id/submit', submitAssessment);
router.get('/:id/results', getResults);

module.exports = router;
