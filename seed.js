const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
dotenv.config();

const User = require('./server/models/User');
const Course = require('./server/models/Course');
const Assessment = require('./server/models/Assessment');

async function seed() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/corporate_training_hub');
  console.log('🔗 Connected to MongoDB');

  // Clear existing
  await Promise.all([User.deleteMany(), Course.deleteMany(), Assessment.deleteMany()]);
  console.log('🗑  Cleared existing data');

  // Create Users
  const adminUser = await User.create({ name: 'Admin User', email: 'admin@corplearn.com', password: 'password123', role: 'admin', department: 'IT' });
  const trainerUser = await User.create({ name: 'Sarah Trainer', email: 'trainer@corplearn.com', password: 'password123', role: 'trainer', department: 'HR' });
  const emp1 = await User.create({ name: 'John Employee', email: 'john@corplearn.com', password: 'password123', role: 'employee', department: 'Engineering' });
  const emp2 = await User.create({ name: 'Priya Sharma', email: 'priya@corplearn.com', password: 'password123', role: 'employee', department: 'Marketing' });
  console.log('👥 Users created');

  // Create Courses
  const course1 = await Course.create({
    title: 'Workplace Safety & Compliance',
    description: 'Essential safety protocols, fire drills, first aid procedures, and compliance regulations every employee must know.',
    category: 'Compliance', level: 'beginner', duration: 90, passingScore: 75,
    link: 'https://www.youtube.com/watch?v=H1mX8ptsmBM',
    instructor: trainerUser._id, isPublished: true, tags: ['safety', 'compliance', 'mandatory'],
    enrolledStudents: [emp1._id, emp2._id],
    lessons: [
      { title: 'Introduction to Workplace Safety', content: 'Overview of safety regulations.', duration: 15, order: 1 },
      { title: 'Fire Safety & Emergency Exits', content: 'Fire drill procedures.', duration: 20, order: 2 },
      { title: 'First Aid Basics', content: 'CPR and first aid.', duration: 25, order: 3 },
      { title: 'Hazard Identification', content: 'Spot and report hazards.', duration: 30, order: 4 },
    ],
  });

  const course2 = await Course.create({
    title: 'Workplace Safety & Compliance',
    description: 'Understand GDPR regulations, data handling best practices, and employee responsibilities regarding personal data.',
    category: 'Legal', level: 'intermediate', duration: 60, passingScore: 80,
    link: 'https://www.youtube.com/watch?v=-mye2vKPHps',
    instructor: trainerUser._id, isPublished: true, tags: ['gdpr', 'privacy', 'legal'],
    enrolledStudents: [emp1._id],
    lessons: [
      { title: 'What is GDPR?', content: 'GDPR overview and scope.', duration: 15, order: 1 },
      { title: 'Data Subject Rights', content: 'Rights of data subjects.', duration: 15, order: 2 },
      { title: 'Data Breach Procedures', content: 'How to respond to breaches.', duration: 15, order: 3 },
      { title: 'Best Practices', content: 'Daily data handling practices.', duration: 15, order: 4 },
    ],
  });

  const course3 = await Course.create({
    title: 'Leadership & Management Skills',
    description: 'Develop your leadership skills, team management techniques, conflict resolution and effective communication.',
    category: 'Leadership', level: 'advanced', duration: 120, passingScore: 70,
    link: 'https://www.youtube.com/watch?v=3euwKJ5NWlQ&list=PLCcteVWYyBtsJWdtqsJkbgT6_VPT1dJQm',
    instructor: trainerUser._id, isPublished: true, tags: ['leadership', 'management', 'soft-skills'],
    enrolledStudents: [],
    lessons: [
      { title: 'Leadership Styles', content: 'Different leadership approaches.', duration: 30, order: 1 },
      { title: 'Team Motivation', content: 'How to motivate your team.', duration: 30, order: 2 },
      { title: 'Conflict Resolution', content: 'Managing workplace conflict.', duration: 30, order: 3 },
      { title: 'Performance Reviews', content: 'Conducting effective reviews.', duration: 30, order: 4 },
    ],
  });

  const course4 = await Course.create({
    title: 'Data Privasy & GDPR',
    description: 'Learn to recognize phishing attacks, manage passwords securely, and protect company data from cyber threats.',
    category: 'IT Security', level: 'beginner', duration: 75, passingScore: 75,
    link: 'https://www.youtube.com/watch?v=ygYi-lOidJM&list=PL3hXnyjyrT0eKiDHLukn4eVsyzJHmSLwQ',
    instructor: adminUser._id, isPublished: false, tags: ['cybersecurity', 'IT', 'phishing'],
    lessons: [
      { title: 'Phishing & Social Engineering', content: 'Recognize phishing attacks.', duration: 25, order: 1 },
      { title: 'Password Management', content: 'Best practices for passwords.', duration: 25, order: 2 },
      { title: 'Secure Remote Work', content: 'VPN and secure connections.', duration: 25, order: 3 },
    ],
  });
  console.log('📚 Courses created');

  // Create Assessments
  await Assessment.create({
    title: 'Workplace Safety Quiz',
    description: 'Test your understanding of workplace safety procedures.',
    course: course1._id, createdBy: trainerUser._id,
    timeLimit: 20, passingScore: 75, maxAttempts: 3, isPublished: true,
    questions: [
      {
        question: 'What is the first action to take when you discover a fire?',
        type: 'mcq', points: 2,
        options: [
          { text: 'Try to extinguish it yourself', isCorrect: false },
          { text: 'Activate the fire alarm and evacuate', isCorrect: true },
          { text: 'Call a colleague', isCorrect: false },
          { text: 'Look for a fire extinguisher', isCorrect: false },
        ],
      },
      {
        question: 'PPE stands for Personal Protective Equipment.',
        type: 'true_false', points: 1,
        options: [{ text: 'True', isCorrect: true }, { text: 'False', isCorrect: false }],
      },
      {
        question: 'How often should fire drills be conducted?',
        type: 'mcq', points: 1,
        options: [
          { text: 'Once every 5 years', isCorrect: false },
          { text: 'Annually or more frequently', isCorrect: true },
          { text: 'Only when required by law', isCorrect: false },
          { text: 'Never — drills are optional', isCorrect: false },
        ],
      },
      {
        question: 'Which number should you call in a workplace emergency in India?',
        type: 'mcq', points: 1,
        options: [
          { text: '100', isCorrect: false },
          { text: '101', isCorrect: false },
          { text: '112', isCorrect: true },
          { text: '102', isCorrect: false },
        ],
      },
      {
        question: 'Employees should report all near-miss incidents, not just injuries.',
        type: 'true_false', points: 1,
        options: [{ text: 'True', isCorrect: true }, { text: 'False', isCorrect: false }],
      },
    ],
  });

  await Assessment.create({
    title: 'GDPR Knowledge Check',
    description: 'Verify your understanding of data privacy regulations.',
    course: course2._id, createdBy: trainerUser._id,
    timeLimit: 15, passingScore: 80, maxAttempts: 2, isPublished: true,
    questions: [
      {
        question: 'GDPR stands for General Data Protection Regulation.',
        type: 'true_false', points: 1,
        options: [{ text: 'True', isCorrect: true }, { text: 'False', isCorrect: false }],
      },
      {
        question: 'Within how many hours must a data breach be reported to the supervisory authority?',
        type: 'mcq', points: 2,
        options: [
          { text: '24 hours', isCorrect: false },
          { text: '48 hours', isCorrect: false },
          { text: '72 hours', isCorrect: true },
          { text: '1 week', isCorrect: false },
        ],
      },
      {
        question: 'Which of the following is a data subject right under GDPR?',
        type: 'mcq', points: 2,
        options: [
          { text: 'Right to be forgotten', isCorrect: true },
          { text: 'Right to access any company data', isCorrect: false },
          { text: 'Right to sell personal data', isCorrect: false },
          { text: 'Right to remain anonymous forever', isCorrect: false },
        ],
      },
    ],
  });

  console.log('📝 Assessments created');

  // Update enrolled users
  await User.findByIdAndUpdate(emp1._id, { enrolledCourses: [course1._id, course2._id] });
  await User.findByIdAndUpdate(emp2._id, { enrolledCourses: [course1._id] });

  console.log('\n✅ Seed complete! Demo accounts:');
  console.log('   Admin:   admin@corplearn.com   / password123');
  console.log('   Trainer: trainer@corplearn.com / password123');
  console.log('   Employee:john@corplearn.com    / password123');
  console.log('   Employee:priya@corplearn.com   / password123');

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch(err => { console.error('❌ Seed error:', err); process.exit(1); });
