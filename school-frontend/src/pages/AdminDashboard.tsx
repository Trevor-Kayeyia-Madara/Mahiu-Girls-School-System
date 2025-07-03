import { useAuth } from '../context/authContext'
import { useNavigate } from 'react-router-dom'

export default function AdminDashboard() {
  const { logout, user } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="p-10 space-y-4">
      <h1 className="text-2xl font-bold">Welcome {user?.name} (Admin)</h1>
      <button onClick={handleLogout} className="px-4 py-2 bg-red-600 text-white rounded">
        Logout
      </button>
    </div>
  )
}
