import { createBrowserRouter } from 'react-router-dom'
import LoginPage from '../pages/Login'
import AdminLayout from '../layouts/AdminLayout'
import AdminDashboard from '../pages/admin/Dashboard'
import ProtectedRoute from './ProtectedRoute'
import AdminUsers from '../pages/admin/Users'
import AdminTeachers from '../pages/admin/Teachers'
import AdminStudents from '../pages/admin/Students'
import AdminClassrooms from '../pages/admin/Classrooms'
import AdminSubjects from '../pages/admin/Subjects'
import AdminAssignments from '../pages/admin/Assignments'
import AdminGrades from '../pages/admin/Grades'
import AdminTimetable from '../pages/admin/Timetable'
import AdminReports from '../pages/admin/Reports'
import TeacherLayout from '../layouts/TeacherLayout'
import TeacherDashboard from '../pages/teacher/Dashboard'
import TeacherTimetable from '../pages/teacher/Timetable'
import ExamsPage from '../pages/teacher/ExamsPage'
import TeacherExamEntry from '../pages/teacher/ExamEntry'
import OverallGradesSummary from '../pages/teacher/OverallGradesSummary'
import TeacherSubjects from '../pages/teacher/Subjects'
import StudentReportCard from '../pages/teacher/Reports'
import ParentDashboard from '../pages/parents/Dashboard'


const router = createBrowserRouter([
  {
    path: '/',
    element: <LoginPage />
  },
  {
    path: '/admin',
    element: <ProtectedRoute allowedRoles={['admin']} />,
    children: [
      {
        element: <AdminLayout />,
        children: [
          { index: true, element: <AdminDashboard /> },
          { path: 'users', element: <AdminUsers /> },
          {path:'teachers', element: <AdminTeachers />},
          {path:'students', element:<AdminStudents />},
          {path:'classrooms', element: <AdminClassrooms />},
          {path:'subjects', element: <AdminSubjects />},
          {path: 'assignments', element: <AdminAssignments />},
          {path:'grades', element: <AdminGrades />},
          {path:'timetable', element: <AdminTimetable />},
          {path:'reports', element: <AdminReports />}
          // Placeholder: Add more admin children routes here later
        ]
      }
    ]
  },
   {
    path: '/teacher',
    element: <ProtectedRoute allowedRoles={['teacher']} />,
    children: [
      {
        element: <TeacherLayout />,
        children: [
          { index: true, element: <TeacherDashboard /> },
          {path:'timetable', element: <TeacherTimetable />},
          {path: 'exam', element: <ExamsPage />},
          {path:'teacher-exam', element: <TeacherExamEntry />},
          {path:'grade-summary', element:<OverallGradesSummary />},
          {path:'subjects', element: <TeacherSubjects />},
          {path:'reports', element: <StudentReportCard />}
          // Placeholder: Add more admin children routes here later
        ]
      }
    ]
  },
  {
    path: '/parent',
    element: <ProtectedRoute allowedRoles={['parent']} />,
    children: [
      {index: true, element: <ParentDashboard />}
    ]
  },
  {
    path: '*',
    element: <div className="p-10 text-red-500">404 Page Not Found</div>
  }
])

export default router
