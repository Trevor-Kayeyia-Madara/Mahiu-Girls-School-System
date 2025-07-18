import { useEffect, useState } from 'react'
import axios from 'axios'
import UserForm from '../../components/UserForm'

interface User {
  user_id: number
  name: string
  email: string
  role: string
}

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [showForm, setShowForm] = useState(false)

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token')
      const res = await axios.get('http://localhost:5001/api/v1/users/', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setUsers(res.data.users || [])
    } catch (err) {
      console.error('Error loading users:', err)
      setUsers([])
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this user?')) return
    try {
      const token = localStorage.getItem('token')
      await axios.delete(`http://localhost:5001/api/v1/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      fetchUsers()
    } catch (err) {
      console.error('Failed to delete user:', err)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  return (
    <div className="p-6 min-h-screen bg-gray-50">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-blue-800">👤 User Management</h1>
          <p className="text-sm text-gray-600 mt-1">Manage all system users from here</p>
        </div>
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
          onClick={() => {
            setSelectedUser(null)
            setShowForm(true)
          }}
        >
          ➕ Add User
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center mt-20">
          <div className="animate-spin h-10 w-10 border-4 border-blue-600 border-t-transparent rounded-full" />
        </div>
      ) : users.length === 0 ? (
        <p className="text-center text-gray-500 mt-10">No users found.</p>
      ) : (
        <div className="overflow-x-auto bg-white shadow rounded">
          <table className="w-full table-auto text-sm text-left border-collapse">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="p-3">Name</th>
                <th className="p-3">Email</th>
                <th className="p-3">Role</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.user_id} className="border-t hover:bg-gray-50">
                  <td className="p-3 font-medium">{u.name}</td>
                  <td className="p-3 text-blue-700">{u.email}</td>
                  <td className="p-3 capitalize">{u.role}</td>
                  <td className="p-3 space-x-2">
                    <button
                      onClick={() => {
                        setSelectedUser(u)
                        setShowForm(true)
                      }}
                      className="text-blue-600 hover:underline"
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => handleDelete(u.user_id)}
                      className="text-red-600 hover:underline"
                    >
                      🗑 Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded shadow-lg p-6 w-full max-w-lg relative animate-fadeIn">
            <button
              onClick={() => setShowForm(false)}
              className="absolute top-2 right-3 text-gray-500 hover:text-gray-800"
            >
              ✕
            </button>
            <UserForm
              user={selectedUser}
              onClose={() => setShowForm(false)}
              onSaved={fetchUsers}
            />
          </div>
        </div>
      )}
    </div>
  )
}
