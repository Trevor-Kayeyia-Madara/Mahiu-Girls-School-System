import { useAuth } from "../../contexts/AuthContext"

export default function TeacherDashboard() {
  const { user } = useAuth()

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">👋 Welcome {user?.name}</h1>
      <p>This is your teacher dashboard.</p>
    </div>
  )
}
