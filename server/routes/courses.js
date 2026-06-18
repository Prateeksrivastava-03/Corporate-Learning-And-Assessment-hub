const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const router = express.Router();
const { getCourses, getCourse, createCourse, updateCourse, deleteCourse, enrollCourse, getCourseStudents, uploadCourseVideo } = require('../controllers/courseController');
const { protect, authorize } = require('../middleware/auth');

const uploadsDir = path.join(__dirname, '..', '..', 'uploads', 'videos');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
	destination: (req, file, cb) => cb(null, uploadsDir),
	filename: (req, file, cb) => {
		const ext = path.extname(file.originalname);
		cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
	},
});

const fileFilter = (req, file, cb) => {
	if (file.mimetype && file.mimetype.startsWith('video/')) return cb(null, true);
	cb(new Error('Only video files are allowed'));
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 1024 * 1024 * 500 } });

router.use(protect);
router.get('/', getCourses);
router.get('/:id', getCourse);
router.post('/', authorize('admin', 'trainer'), createCourse);
router.put('/:id', authorize('admin', 'trainer'), updateCourse);
router.delete('/:id', authorize('admin', 'trainer'), deleteCourse);
router.post('/:id/enroll', authorize('employee'), enrollCourse);
router.get('/:id/students', authorize('admin', 'trainer'), getCourseStudents);
router.post('/:id/video', authorize('admin', 'trainer'), upload.single('video'), uploadCourseVideo);

module.exports = router;
