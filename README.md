# 🏫 School Management System

A full-featured School Management System built with **Flask (Python)** for the backend and **React + TypeScript** for the frontend. The system supports multi-role dashboards for **Admins**, **Teachers**, **Parents**, and optionally **Students**.

---

## 🚀 Features

### ✅ Admin Panel

- User management (create, read, update, delete)
- Manage Teachers, Students, Subjects, Classrooms
- Assign Subjects and Class Teachers
- Create Timetables with inline editing
- Manage Exam Types and Schedules
- View and export Class and Student Reports (CSV/PDF)
- View KCSE-style rankings and class mean scores

### ✅ Teacher Panel

- View assigned subjects and classes
- Enter and update student grades per exam
- View and export performance summaries
- Generate class reports
- Student performance breakdown and analysis

### ✅ Parent Panel

- View child’s academic performance
- Download child’s report cards (CSV/PDF)
- View class position and KCSE grade summaries

---

## 🧰 Tech Stack

| Area        | Stack                              |
|-------------|-------------------------------------|
| **Frontend** | React, TypeScript, Tailwind CSS     |
| **Backend**  | Python, Flask, SQLAlchemy           |
| **Database** | PostgreSQL or SQLite (dev mode)     |
| **Auth**     | JWT-based Role Authorization        |
| **PDF Export** | ReportLab                         |
| **CSV Export** | Python CSV module                 |

---

## 📁 Project Structure

```
📦 school-management-system/
├── backend/
│   ├── app.py
│   ├── models/
│   ├── routes/
│   │   ├── admin.py
│   │   ├── teachers.py
│   │   ├── parents.py
│   │   └── reports.py
│   ├── utils/
│   └── ...
└── frontend/
    ├── src/
    │   ├── pages/
    │   │   ├── Admin/
    │   │   ├── Teacher/
    │   │   ├── Parent/
    │   │   └── Shared/
    │   ├── components/
    │   └── App.tsx

```

## 🛠️ Setup Instructions

### 1. Backend Setup (Flask)

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

Create `.env` file:

```env
SECRET_KEY=your-secret
DATABASE_URL=sqlite:///school.db  # or PostgreSQL URI
```

Initialize database:

```bash
flask db init
flask db migrate
flask db upgrade
```

Run the server:

```bash
flask run
```

### 2. Frontend Setup (React)

```bash
cd frontend
npm install
npm run dev
```

Ensure the frontend connects to:  
`http://localhost:5001` for API calls.

---

## 📦 Key Endpoints Summary

### 🔐 Auth

- `POST /api/v1/auth/login`
- `POST /api/v1/auth/register` (admin only)

### 👨‍🏫 Admin

- `GET/POST /api/v1/teachers`
- `GET/POST /api/v1/students`
- `GET/POST /api/v1/subjects`
- `GET/POST /api/v1/classrooms`
- `GET /api/v1/grades/class/:id`
- `GET /api/v1/reports/export/class/:id/pdf`

### 👨‍🏫 Teachers

- `GET /api/v1/teacher-subjects/me`
- `POST /api/v1/grades`
- `GET /api/v1/grades/summary/class/:class_id/subject/:subject_id`
- `GET /api/v1/reports/class/:class_id`
- `GET /api/v1/reports/export/student/:id/pdf`

### 👨‍👩‍👧‍👦 Parents

- `GET /api/v1/parents/me/students`
- `GET /api/v1/reports/student/:id`
- `GET /api/v1/reports/export/student/:id/pdf`

---

## 📊 Reporting & Analysis

- 📝 Class-wise summaries with position and KCSE grading
- 📄 Export to CSV or PDF
- 📈 View rankings per Form Level (Form 1–4) across all streams
- 🧮 Mean scores calculated using:
  - `CAT 1 + CAT 2 → 40%`
  - `Main Exam → 60%`

---

## 🧪 Testing Accounts

| Role    | Email               | Password  |
|---------|---------------------|-----------|
| Admin   | <admin@example.com>   | admin123  |
| Teacher | <teacher@example.com> | teach123  |
| Parent  | <parent@example.com>  | parent123 |

Create test accounts via the Admin Panel.

---

## ✨ Optional Features (Advanced Ideas)

- 📆 Attendance tracking
- 💬 Teacher–Parent messaging
- 📬 Email notifications on grade updates
- 📅 Dynamic term/year filtering for reports
- 🧾 Fee payment tracking module
- 📱 Mobile-friendly version (PWA or Flutter)

---

## 📚 License

MIT © 2025 — Built with ❤️ for educational institutions.
