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
          {path: 'assignments', element: <AdminAssignments />}
          // Placeholder: Add more admin children routes here later
        ]
      }
    ]
  },
  {
    path: '*',
    element: <div className="p-10 text-red-500">404 Page Not Found</div>
  }
])

export default router
