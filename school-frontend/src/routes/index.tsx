import { createBrowserRouter } from 'react-router-dom'
import LoginPage from '../pages/Login'
import AdminLayout from '../layouts/AdminLayout'
import AdminDashboard from '../pages/admin/Dashboard'
import ProtectedRoute from './ProtectedRoute'
import AdminUsers from '../pages/admin/Users'
import AdminTeachers from '../pages/admin/Teachers'

const router = createBrowserRouter([
  {
    path: '/login',
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
          {path:'teachers', element: <AdminTeachers />}
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
