import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from '../pages/LoginPage'
import AdminDashboard from '../pages/AdminDashboard'
import StudentDashboard from '../pages/StudentDashboard'
import TeacherDashboard from '../pages/TeacherDashboard'
import Unauthorized from '../pages/Unauthorized'
import ProtectedRoute from './ProtectedRoute'
import AdminLayout from '../layouts/AdminLayout'
import AdminStudents from '../pages/AdminStudents'
import AdminStaff from '../pages/AdminStaff'
import AdminClassAssignments from '../pages/AdminClassAssignments'
import AdminGradebook from '../pages/AdminGradeBook'
import AdminTimetable from '../pages/AdminTimetable'
import AdminPerformance from '../pages/AdminPerformance'
import AdminSettings from '../pages/AdminSettings'
import AdminMessages from '../pages/AdminMessages'

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/unauthorized" element={<Unauthorized />} />
              <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminLayout>
              <AdminDashboard />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
  path="/admin/class-assignments"
  element={
    <ProtectedRoute allowedRoles={['admin']}>
      <AdminClassAssignments />
    </ProtectedRoute>
  }
/>
    <Route
  path="/admin/reports"
  element={
    <ProtectedRoute allowedRoles={['admin']}>
      <AdminGradebook />
    </ProtectedRoute>
  }
/>
    <Route
  path="/admin/timetabling"
  element={
    <ProtectedRoute allowedRoles={['admin']}>
      <AdminTimetable/>
    </ProtectedRoute>
  }
/>
    <Route
  path="/admin/settings"
  element={
    <ProtectedRoute allowedRoles={['admin']}>
      <AdminSettings />
    </ProtectedRoute>
  }
/>
    <Route
  path="/admin/performance"
  element={
    <ProtectedRoute allowedRoles={['admin']}>
      <AdminPerformance />
    </ProtectedRoute>
  }
/>
    <Route
  path="/admin/messages"
  element={
    <ProtectedRoute allowedRoles={['admin']}>
      <AdminMessages />
    </ProtectedRoute>
  }
/>
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
  path="/admin/students"
  element={
    <ProtectedRoute allowedRoles={['admin']}>
      <AdminLayout>
        <AdminStudents />
      </AdminLayout>
    </ProtectedRoute>
  }
/>
<Route
  path="/admin/staff"
  element={
    <ProtectedRoute allowedRoles={['admin']}>
      <AdminStaff />
    </ProtectedRoute>
  }
/>
        <Route
          path="/teacher/dashboard"
          element={
            <ProtectedRoute allowedRoles={['teacher']}>
              <TeacherDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/dashboard"
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <StudentDashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}