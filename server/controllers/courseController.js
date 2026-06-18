const Course = require('../models/Course');
const Progress = require('../models/Progress');
const User = require('../models/User');

// @GET /api/courses
exports.getCourses = async (req, res) => {
  try {
    const filter = req.user.role === 'employee' ? { isPublished: true } : {};
    const courses = await Course.find(filter).populate('instructor', 'name email').sort('-createdAt');
    res.json({ success: true, count: courses.length, courses });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// @GET /api/courses/:id
exports.getCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id).populate('instructor', 'name email');
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });
    res.json({ success: true, course });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// @POST /api/courses
exports.createCourse = async (req, res) => {
  try {
    const course = await Course.create({ ...req.body, instructor: req.user.id });
    res.status(201).json({ success: true, course });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// @PUT /api/courses/:id
exports.updateCourse = async (req, res) => {
  try {
    const course = await Course.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });
    res.json({ success: true, course });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// @DELETE /api/courses/:id
exports.deleteCourse = async (req, res) => {
  try {
    await Course.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Course deleted' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// @POST /api/courses/:id/enroll
exports.enrollCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });
    if (course.enrolledStudents.includes(req.user.id)) {
      return res.status(400).json({ success: false, message: 'Already enrolled' });
    }
    course.enrolledStudents.push(req.user.id);
    await course.save();
    await User.findByIdAndUpdate(req.user.id, { $addToSet: { enrolledCourses: course._id } });
    await Progress.create({ user: req.user.id, course: course._id, lessonsProgress: course.lessons.map(l => ({ lessonId: l._id, completed: false })) });
    res.json({ success: true, message: 'Enrolled successfully' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// @GET /api/courses/:id/students
exports.getCourseStudents = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id).populate('enrolledStudents', 'name email department');
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });
    res.json({ success: true, students: course.enrolledStudents });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// @POST /api/courses/:id/video
exports.uploadCourseVideo = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'Video file is required' });
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    course.videoFile = `${baseUrl}/uploads/videos/${req.file.filename}`;
    await course.save();
    res.json({ success: true, course });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};
