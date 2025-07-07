import { useEffect, useState } from 'react'
import axios from 'axios'
import AdminLayout from '../layouts/AdminLayout'
import type { Staff } from '../types/Staff'

export default function AdminStaff() {
  const [staffList, setStaffList] = useState<Staff[]>([])
  const [loading, setLoading] = useState(true)

  const fetchStaff = async () => {
    try {
      const res = await axios.get('http://localhost:5001/api/v1/staff')
      setStaffList(res.data)
    } catch (err) {
      console.error('Failed to load staff', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStaff()
  }, [])

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this teacher?')) return
    await axios.delete(`http://localhost:5001/api/v1/staff/${id}`)
    fetchStaff()
  }

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold mb-4">👩‍🏫 Manage Staff / Teachers</h1>

      <button
        onClick={() => alert('Add form coming soon')}
        className="mb-4 px-4 py-2 bg-blue-600 text-white rounded"
      >
        ➕ Add Teacher
      </button>

      {loading ? (
        <p>Loading staff...</p>
      ) : (
        <table className="w-full bg-white shadow rounded table-auto">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2">Name</th>
              <th className="p-2">Email</th>
              <th className="p-2">ID</th>
              <th className="p-2">Gender</th>
              <th className="p-2">Contact</th>
              <th className="p-2">Role</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {staffList.map((s) => (
              <tr key={s.staff_id} className="border-t">
                <td className="p-2">{s.user.name}</td>
                <td className="p-2">{s.user.email}</td>
                <td className="p-2">{s.employee_id}</td>
                <td className="p-2">{s.gender}</td>
                <td className="p-2">{s.contact}</td>
                <td className="p-2">{s.role}</td>
                <td className="p-2 space-x-2">
                  <button className="text-blue-600" onClick={() => alert('Edit coming soon')}>
                    Edit
                  </button>
                  <button className="text-red-600" onClick={() => handleDelete(s.staff_id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {staffList.length === 0 && (
              <tr>
                <td colSpan={7} className="p-4 text-center text-gray-500">
                  No staff found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </AdminLayout>
  )
}
