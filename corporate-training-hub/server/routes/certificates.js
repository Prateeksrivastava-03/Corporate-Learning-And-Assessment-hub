const express = require('express');
const router = express.Router();
const { getMyCertificates, issueCertificate, getAllCertificates } = require('../controllers/progressController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.get('/', getMyCertificates);
router.post('/issue', authorize('admin', 'trainer'), issueCertificate);
router.get('/all', authorize('admin'), getAllCertificates);

module.exports = router;
