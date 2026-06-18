const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const Course = require('./server/models/Course');
const Assessment = require('./server/models/Assessment');
const User = require('./server/models/User');

const makeMcq = (question, options, correctIndex, points = 1, explanation = '') => ({
  question,
  type: 'mcq',
  points,
  explanation,
  options: options.map((text, idx) => ({ text, isCorrect: idx === correctIndex })),
});

const makeTrueFalse = (question, isTrue, points = 1, explanation = '') => ({
  question,
  type: 'true_false',
  points,
  explanation,
  options: [
    { text: 'True', isCorrect: isTrue },
    { text: 'False', isCorrect: !isTrue },
  ],
});

async function seedQuizzes() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/corporate_training_hub');
  console.log('🔗 Connected to MongoDB');

  const trainer = await User.findOne({ role: 'trainer' });
  if (!trainer) {
    throw new Error('Trainer user not found. Please run seed.js first.');
  }

  const course1 = await Course.findOne({ category: 'Compliance' });
  const course2 = await Course.findOne({ category: 'Legal' });

  if (!course1 || !course2) {
    throw new Error('Courses not found. Please run seed.js first.');
  }

  const quiz1Questions = [
    makeMcq('What is the primary goal of workplace safety rules?', ['Increase profit only', 'Prevent injuries and accidents', 'Reduce training time', 'Avoid reporting incidents'], 1, 2),
    makeTrueFalse('PPE stands for Personal Protective Equipment.', true),
    makeMcq('When should you report a hazard?', ['Only after an incident', 'Immediately when noticed', 'At the end of the week', 'Only if told by a manager'], 1),
    makeMcq('Which is an example of a near-miss?', ['A minor injury', 'A fire drill', 'A slip without injury', 'A safety audit'], 2),
    makeTrueFalse('Fire exits should be kept clear at all times.', true),
    makeMcq('What is the best first step in an emergency evacuation?', ['Grab personal items', 'Follow the marked exit route', 'Use the elevator', 'Finish your task'], 1),
    makeMcq('Who is responsible for safety?', ['Only safety officers', 'Only managers', 'Everyone at the workplace', 'Only new employees'], 2),
    makeTrueFalse('Reporting hazards can prevent future incidents.', true),
    makeMcq('Which item is considered PPE?', ['Hard hat', 'Coffee mug', 'Phone charger', 'Notebook'], 0),
    makeMcq('If you see a spill on the floor, you should:', ['Ignore it', 'Report and clean if safe', 'Wait for someone else', 'Block exits'], 1),
    makeTrueFalse('You should block fire extinguishers with boxes.', false),
    makeMcq('What should you do before lifting heavy objects?', ['Twist your back', 'Check weight and use proper technique', 'Lift quickly', 'Hold away from body'], 1),
    makeMcq('Why are safety signs important?', ['They are decorative', 'They communicate hazards and instructions', 'They replace training', 'They are optional'], 1),
    makeTrueFalse('Using damaged equipment is acceptable if work is urgent.', false),
    makeMcq('Which is a safe electrical practice?', ['Overloading sockets', 'Using frayed cords', 'Keeping cords in good condition', 'Running cords under carpets'], 2),
    makeMcq('What is the correct response to a fire alarm?', ['Investigate first', 'Evacuate immediately', 'Ignore it', 'Finish the meeting'], 1),
    makeTrueFalse('Only management should participate in safety drills.', false),
    makeMcq('What does a wet floor sign indicate?', ['Maintenance complete', 'Hazard present', 'Safe to run', 'No entry'], 1),
    makeMcq('Which of these helps prevent slips and trips?', ['Cluttered walkways', 'Proper housekeeping', 'Dim lighting', 'Loose cables'], 1),
    makeTrueFalse('Safety training is only for new hires.', false),
    makeMcq('If you feel unwell at work, you should:', ['Hide it', 'Report to supervisor or HR', 'Leave without notice', 'Continue working'], 1),
    makeMcq('What is the purpose of a safety data sheet (SDS)?', ['Track attendance', 'Describe chemical hazards and handling', 'List company holidays', 'Show payroll data'], 1),
    makeTrueFalse('Emergency contact numbers should be visible.', true),
    makeMcq('When should you wear hearing protection?', ['When required by policy or signage', 'Only during meetings', 'Never', 'Only outdoors'], 0),
    makeMcq('Good ergonomic posture includes:', ['Slouched back', 'Neutral wrist position', 'Eyes far above monitor', 'Feet dangling'], 1),
  ];

  const quiz2Questions = [
    makeMcq('GDPR primarily protects:', ['Company profits', 'Personal data of individuals', 'Office equipment', 'Public holidays'], 1, 2),
    makeTrueFalse('Personal data includes email addresses.', true),
    makeMcq('Which is a lawful basis for processing data?', ['Because it is easy', 'Consent', 'Curiosity', 'Tradition'], 1),
    makeMcq('Data minimization means:', ['Collecting as much data as possible', 'Collecting only what is necessary', 'Storing data forever', 'Sharing data widely'], 1),
    makeTrueFalse('People have the right to access their personal data.', true),
    makeMcq('A data breach should be reported within:', ['72 hours', '30 days', '1 year', 'No need to report'], 0),
    makeMcq('Which is considered sensitive data?', ['Favorite color', 'Health information', 'Desk number', 'Job title'], 1),
    makeTrueFalse('Passwords should be shared to speed up work.', false),
    makeMcq('What is pseudonymization?', ['Deleting data', 'Replacing identifiers with tokens', 'Printing data', 'Posting data online'], 1),
    makeMcq('Who is responsible for data protection?', ['Only IT', 'Only legal', 'Everyone handling data', 'Only external vendors'], 2),
    makeTrueFalse('You should verify identity before sharing personal data.', true),
    makeMcq('What is the purpose of a privacy notice?', ['Hide data use', 'Inform users how data is used', 'Avoid regulations', 'Replace consent'], 1),
    makeMcq('Which action best supports security?', ['Using shared accounts', 'Strong unique passwords', 'Writing passwords on paper', 'Ignoring updates'], 1),
    makeTrueFalse('Data should be kept longer than necessary.', false),
    makeMcq('A data processor is:', ['The person whose data is processed', 'A party processing data on behalf of a controller', 'A regulator', 'A marketing lead'], 1),
    makeMcq('What is a DPIA?', ['A tax form', 'Data Protection Impact Assessment', 'Device purchase invoice', 'Digital policy index'], 1),
    makeTrueFalse('Encryption helps protect data in transit.', true),
    makeMcq('Which is a good practice for email?', ['Send to all by default', 'Double-check recipients', 'Ignore phishing signs', 'Open unknown attachments'], 1),
    makeMcq('The right to be forgotten means:', ['Data can never be deleted', 'Data can be erased in certain cases', 'Data must be published', 'Only employees can delete data'], 1),
    makeTrueFalse('Access should be limited to those who need data.', true),
    makeMcq('What should you do if you suspect a breach?', ['Hide it', 'Report immediately', 'Delete logs', 'Wait a week'], 1),
    makeMcq('Which is an example of personal data?', ['Company logo', 'Phone number', 'Office printer', 'Cafeteria menu'], 1),
    makeTrueFalse('Consent must be clear and specific.', true),
    makeMcq('What does data integrity ensure?', ['Data is accurate and complete', 'Data is public', 'Data is unlimited', 'Data is anonymous'], 0),
    makeMcq('A strong password typically includes:', ['Only letters', 'Letters, numbers, symbols', 'Your name', 'Company name'], 1),
  ];

  await Assessment.deleteMany({ title: { $in: ['Workplace Safety Quiz - Extended', 'GDPR Knowledge Check - Extended'] } });

  await Assessment.create({
    title: 'Workplace Safety Quiz - Extended',
    description: 'Extended quiz with 25 questions on workplace safety.',
    course: course1._id,
    createdBy: trainer._id,
    timeLimit: 30,
    passingScore: 75,
    maxAttempts: 3,
    isPublished: true,
    questions: quiz1Questions,
  });

  await Assessment.create({
    title: 'GDPR Knowledge Check - Extended',
    description: 'Extended quiz with 25 questions on data privacy and GDPR.',
    course: course2._id,
    createdBy: trainer._id,
    timeLimit: 30,
    passingScore: 80,
    maxAttempts: 2,
    isPublished: true,
    questions: quiz2Questions,
  });

  console.log('📝 Seeded 2 extended quizzes with 25 questions each.');
  await mongoose.disconnect();
  process.exit(0);
}

seedQuizzes().catch(err => { console.error('❌ Seed error:', err.message); process.exit(1); });
