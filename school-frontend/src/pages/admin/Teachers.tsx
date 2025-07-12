import { useEffect, useState } from 'react'
import axios from 'axios'
import TeacherForm from '../../components/TeacherForm'

interface Teacher {
  teacher_id: number
  name: string
  email: string
  employee_number: string
  gender: string
  contact: string
  qualifications: string
}

export default function AdminTeachers() {
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null)

  const fetchTeachers = async () => {
    try {
      const token = localStorage.getItem("token")
      const res = await axios.get('http://localhost:5001/api/v1/teachers',{headers: {Authorization: `Bearer ${token}`}})
      setTeachers(res.data)
    } catch (err) {
      console.error('Error fetching teachers:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this teacher?')) return
    try {
      await axios.delete(`/api/v1/teachers/${id}`)
      fetchTeachers()
    } catch (err) {
      console.error('Error deleting teacher:', err)
    }
  }

  useEffect(() => {
    fetchTeachers()
  }, [])

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">👩‍🏫 Manage Teachers</h1>

      <button
        onClick={() => {
          setEditingTeacher(null)
          setShowForm(true)
        }}
        className="mb-4 px-4 py-2 bg-blue-600 text-white rounded"
      >
        ➕ Add Teacher
      </button>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <table className="w-full bg-white shadow table-auto rounded">
          <thead className="bg-gray-100">
            <tr>
              <th className="text-left p-2">Name</th>
              <th className="text-left p-2">Email</th>
              <th className="text-left p-2">Emp. #</th>
              <th className="text-left p-2">Gender</th>
              <th className="text-left p-2">Contact</th>
              <th className="text-left p-2">Qualifications</th>
              <th className="text-left p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {teachers.map((t) => (
              <tr key={t.teacher_id} className="border-t">
                <td className="p-2">{t.name}</td>
                <td className="p-2">{t.email}</td>
                <td className="p-2">{t.employee_number}</td>
                <td className="p-2">{t.gender}</td>
                <td className="p-2">{t.contact}</td>
                <td className="p-2">{t.qualifications}</td>
                <td className="p-2 space-x-2">
                  <button
                    className="text-blue-600 hover:underline"
                    onClick={() => {
                      setEditingTeacher(t)
                      setShowForm(true)
                    }}
                  >
                    Edit
                  </button>
                  <button
                    className="text-red-600 hover:underline"
                    onClick={() => handleDelete(t.teacher_id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {teachers.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center text-gray-500 p-4">
                  No teachers found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}

      {showForm && (
        <TeacherForm
          teacher={editingTeacher}
          onClose={() => setShowForm(false)}
          onSaved={fetchTeachers}
        />
      )}
    </div>
  )
}
