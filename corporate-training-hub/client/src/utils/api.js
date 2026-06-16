import axios from 'axios';

// Courses
export const api = {
  // Auth
  login: (d) => axios.post('/auth/login', d),
  register: (d) => axios.post('/auth/register', d),
  getMe: () => axios.get('/auth/me'),

  // Users
  getUsers: () => axios.get('/users'),
  getUser: (id) => axios.get(`/users/${id}`),
  updateUser: (id, d) => axios.put(`/users/${id}`, d),
  deleteUser: (id) => axios.delete(`/users/${id}`),

  // Courses
  getCourses: () => axios.get('/courses'),
  getCourse: (id) => axios.get(`/courses/${id}`),
  createCourse: (d) => axios.post('/courses', d),
  updateCourse: (id, d) => axios.put(`/courses/${id}`, d),
  deleteCourse: (id) => axios.delete(`/courses/${id}`),
  enrollCourse: (id) => axios.post(`/courses/${id}/enroll`),
  getCourseStudents: (id) => axios.get(`/courses/${id}/students`),
  uploadCourseVideo: (id, file) => {
    const form = new FormData();
    form.append('video', file);
    return axios.post(`/courses/${id}/video`, form, { headers: { 'Content-Type': 'multipart/form-data' } });
  },

  // Assessments
  getAssessments: () => axios.get('/assessments'),
  getAssessment: (id) => axios.get(`/assessments/${id}`),
  createAssessment: (d) => axios.post('/assessments', d),
  updateAssessment: (id, d) => axios.put(`/assessments/${id}`, d),
  deleteAssessment: (id) => axios.delete(`/assessments/${id}`),
  submitAssessment: (id, d) => axios.post(`/assessments/${id}/submit`, d),
  getAssessmentResults: (id) => axios.get(`/assessments/${id}/results`),

  // Progress
  getMyProgress: () => axios.get('/progress'),
  getCourseProgress: (courseId) => axios.get(`/progress/${courseId}`),
  updateLessonProgress: (courseId, lessonId, d) => axios.put(`/progress/${courseId}/lesson/${lessonId}`, d),
  getAllProgress: () => axios.get('/progress/all'),

  // Certificates
  getMyCertificates: () => axios.get('/certificates'),
  issueCertificate: (d) => axios.post('/certificates/issue', d),
  getAllCertificates: () => axios.get('/certificates/all'),

  // Analytics
  getOverview: () => axios.get('/analytics/overview'),
  getUserAnalytics: () => axios.get('/analytics/users'),
  getCourseAnalytics: () => axios.get('/analytics/courses'),
  getAssessmentAnalytics: () => axios.get('/analytics/assessments'),
};

export default api;
