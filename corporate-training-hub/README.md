# 🎓 CorpLearn — Corporate Training & Assessment Hub

A full-stack **MERN** application for managing corporate training programs, assessments, employee progress, and certificates.

---

## 🗂 Project Structure

```
corporate-training-hub/
├── server/                     # Express + Node.js Backend
│   ├── config/
│   │   └── db.js               # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── courseController.js
│   │   ├── assessmentController.js
│   │   ├── progressController.js
│   │   ├── userController.js
│   │   └── analyticsController.js
│   ├── middleware/
│   │   └── auth.js             # JWT protect + role authorize
│   ├── models/
│   │   ├── User.js
│   │   ├── Course.js
│   │   ├── Assessment.js
│   │   ├── Progress.js
│   │   └── AssessmentResult.js # Also exports Certificate model
│   ├── routes/
│   │   ├── auth.js
│   │   ├── users.js
│   │   ├── courses.js
│   │   ├── assessments.js
│   │   ├── progress.js
│   │   ├── certificates.js
│   │   └── analytics.js
│   └── index.js                # Express app entry point
│
├── client/                     # React Frontend
│   ├── public/
│   │   └── index.html
│   └── src/
│       ├── components/
│       │   ├── common/
│       │   │   └── UI.jsx      # Reusable UI components
│       │   └── layout/
│       │       ├── Layout.jsx
│       │       └── Sidebar.jsx
│       ├── context/
│       │   └── AuthContext.jsx
│       ├── pages/
│       │   ├── Auth.jsx        # Login + Register
│       │   ├── admin/
│       │   │   ├── Dashboard.jsx
│       │   │   ├── Users.jsx
│       │   │   ├── Courses.jsx
│       │   │   ├── Assessments.jsx
│       │   │   └── Analytics.jsx  # Also exports CertificatesPage
│       │   ├── trainer/
│       │   │   ├── Dashboard.jsx
│       │   │   ├── Students.jsx
│       │   │   └── Analytics.jsx
│       │   └── employee/
│       │       ├── Dashboard.jsx
│       │       ├── Courses.jsx
│       │       ├── Assessments.jsx
│       │       └── Progress.jsx   # Also exports CertificatesPage
│       ├── utils/
│       │   └── api.js          # Axios API calls
│       ├── App.jsx             # Routes + protected route logic
│       ├── index.js
│       └── index.css           # Global design system
│
├── seed.js                     # Demo data seeder
├── package.json                # Root (server deps + scripts)
└── .env.example
```

---

## ⚡ Quick Start

### 1. Prerequisites
- Node.js v18+
- MongoDB (local or Atlas)

### 2. Clone & Install

```bash
# Install all dependencies (server + client)
npm run install-all
```

### 3. Environment Setup

```bash
cp .env.example .env
```

Edit `.env`:
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/corporate_training_hub
JWT_SECRET=your_super_secret_key_here
JWT_EXPIRE=30d
NODE_ENV=development
```

### 4. Seed Demo Data (optional but recommended)

```bash
node seed.js
```

This creates 4 demo accounts, 4 courses, and 2 assessments.

### 5. Run the App

```bash
npm run dev
```

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000

---

## 🔑 Demo Accounts

| Role     | Email                    | Password    |
|----------|--------------------------|-------------|
| Admin    | admin@corplearn.com      | password123 |
| Trainer  | trainer@corplearn.com    | password123 |
| Employee | john@corplearn.com       | password123 |
| Employee | priya@corplearn.com      | password123 |

---

## 🧩 Features

### 👑 Admin
- Full platform overview dashboard with analytics
- User management (create, edit, deactivate, delete)
- Course management (create, publish, delete)
- Assessment builder (MCQ, True/False, Short Answer)
- View all certificates issued
- Platform-wide analytics with charts

### 🎓 Trainer
- Dashboard with student activity overview
- Create and manage courses & assessments
- View all student progress across courses
- Analytics: enrollment, score distribution, completions

### 👤 Employee
- Personal dashboard with enrolled courses
- Browse & enroll in published courses
- Take timed assessments with result screen
- Track progress per course
- View earned certificates

---

## 🛠 Tech Stack

| Layer      | Technology                             |
|------------|----------------------------------------|
| Frontend   | React 18, React Router v6, Recharts    |
| Styling    | Pure CSS custom design system          |
| Backend    | Node.js, Express.js                    |
| Database   | MongoDB, Mongoose                      |
| Auth       | JWT (jsonwebtoken), bcryptjs           |
| Dev Tools  | Nodemon, Concurrently                  |

---

## 📡 API Endpoints

### Auth
| Method | Endpoint              | Description        |
|--------|-----------------------|--------------------|
| POST   | /api/auth/register    | Register user      |
| POST   | /api/auth/login       | Login              |
| GET    | /api/auth/me          | Get current user   |
| PUT    | /api/auth/updateprofile | Update profile   |
| PUT    | /api/auth/changepassword | Change password |

### Courses
| Method | Endpoint                    | Role           |
|--------|-----------------------------|----------------|
| GET    | /api/courses                | All            |
| POST   | /api/courses                | Admin, Trainer |
| PUT    | /api/courses/:id            | Admin, Trainer |
| DELETE | /api/courses/:id            | Admin, Trainer |
| POST   | /api/courses/:id/enroll     | Employee       |

### Assessments
| Method | Endpoint                        | Role           |
|--------|---------------------------------|----------------|
| GET    | /api/assessments                | All            |
| POST   | /api/assessments                | Admin, Trainer |
| POST   | /api/assessments/:id/submit     | All            |
| GET    | /api/assessments/:id/results    | All            |

### Analytics (Admin/Trainer only)
| Method | Endpoint                  |
|--------|---------------------------|
| GET    | /api/analytics/overview   |
| GET    | /api/analytics/users      |
| GET    | /api/analytics/courses    |
| GET    | /api/analytics/assessments|
