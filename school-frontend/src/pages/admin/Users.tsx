import { useEffect, useState } from 'react'
import axios from 'axios'

interface User {
  user_id: number
  name: string
  email: string
  role: string
}

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  const fetchUsers = async () => {
  const token = localStorage.getItem('token')
  console.log("Token being sent:", token) 
    try {
      const res = await axios.get('http://localhost:5001/api/v1/users/', {
  headers: {
    Authorization: `Bearer ${token}`,
  },
})
      const userData = res.data?.users

      if (Array.isArray(userData)) {
        setUsers(userData)
      } else {
        console.error('Unexpected user data format:', res.data)
        setUsers([]) // fallback to empty array
      }
    } catch (err) {
      console.error('Failed to fetch users:', err)
      setUsers([]) // fallback on error
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (user_id: number) => {
    if (!confirm('Are you sure you want to delete this user?')) return

    try {
      await axios.delete(`/api/v1/users/${user_id}`)
      fetchUsers() // refresh list after deletion
    } catch (err) {
      console.error('Failed to delete user:', err)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">👥 Manage Users</h2>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <table className="w-full table-auto border bg-white shadow rounded">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="p-2">Name</th>
              <th className="p-2">Email</th>
              <th className="p-2">Role</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.length > 0 ? (
              users.map((user) => (
                <tr key={user.user_id} className="border-t">
                  <td className="p-2">{user.name}</td>
                  <td className="p-2">{user.email}</td>
                  <td className="p-2 capitalize">{user.role}</td>
                  <td className="p-2 space-x-2">
                    <button
                      onClick={() => handleDelete(user.user_id)}
                      className="text-red-500 hover:underline"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="p-4 text-center text-gray-500">
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  )
}
