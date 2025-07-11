import { useEffect, useState } from 'react'
import axios from 'axios'
import UserForm from '../../components/UserForm'

interface User {
  user_id: number
  name: string
  email: string
  role: string
}

// ... (rest of your imports and interfaces)

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [showForm, setShowForm] = useState(false)

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token')
      console.log("This is the token", token)
      const res = await axios.get('http://localhost:5001/api/v1/users/',
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )
      // Assuming your API returns { success: true, data: [...] }
      setUsers(res.data.users) // <--- THIS IS THE LIKELY FIX
    } catch (err) {
      console.error('Error loading users:', err)
      setUsers([]); // Good practice to ensure users is always an array on error
    } finally {
      setLoading(false)
    }
  }

  // ... (rest of your component)
  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this user?')) return
    await axios.delete(`/api/v1/users/${id}`)
    fetchUsers()
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">👤 User Management</h1>
      <button
        className="mb-4 px-4 py-2 bg-blue-600 text-white rounded"
        onClick={() => {
          setSelectedUser(null)
          setShowForm(true)
        }}
      >
        ➕ Add User
      </button>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <table className="w-full bg-white shadow rounded">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2">Name</th>
              <th className="p-2">Email</th>
              <th className="p-2">Role</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.user_id} className="border-t">
                <td className="p-2">{u.name}</td>
                <td className="p-2">{u.email}</td>
                <td className="p-2">{u.role}</td>
                <td className="p-2 space-x-2">
                  <button
                    onClick={() => {
                      setSelectedUser(u)
                      setShowForm(true)
                    }}
                    className="text-blue-600 hover:underline"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(u.user_id)}
                    className="text-red-600 hover:underline"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {showForm && (
        <UserForm
          user={selectedUser}
          onClose={() => setShowForm(false)}
          onSaved={fetchUsers}
        />
      )}
    </div>
  )
}