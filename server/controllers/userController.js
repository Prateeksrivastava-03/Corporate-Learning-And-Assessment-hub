const User = require('../models/User');

// @GET /api/users  (admin only)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password').sort('-createdAt');
    res.json({ success: true, count: users.length, users });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// @GET /api/users/:id
exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password').populate('enrolledCourses', 'title').populate('certificates');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, user });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// @PUT /api/users/:id  (admin only)
exports.updateUser = async (req, res) => {
  try {
    const { name, email, role, department, isActive } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, { name, email, role, department, isActive }, { new: true, runValidators: true }).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, user });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// @DELETE /api/users/:id  (admin only)
exports.deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'User deleted' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};
