/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react'
import axios from 'axios'


interface Student {
  student_id: number
  name: string
  admission_number: string
  class_name: string
}

export default function AdminStudents() {
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)

  const fetchStudents = async () => {
    const res = await axios.get('/api/v1/students')
    const data = res.data.map((s: any) => ({
      student_id: s.student_id,
      name: s.user.name,
      admission_number: s.admission_number,
      class_name: s.classroom?.class_name || 'N/A',
    }))
    setStudents(data)
    setLoading(false)
  }

  useEffect(() => {
    fetchStudents()
  }, [])

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this student?')) return
    await axios.delete(`/api/v1/students/${id}`)
    fetchStudents()
  }

  return (
      <div>
        <h1 className="text-2xl font-bold mb-4">👥 Manage Students</h1>

        <button
          onClick={() => alert('Show add form (coming soon)')}
          className="mb-4 px-4 py-2 bg-blue-600 text-white rounded"
        >
          ➕ Add Student
        </button>

        {loading ? (
          <p>Loading...</p>
        ) : (
          <table className="w-full table-auto bg-white shadow rounded">
            <thead className="bg-gray-100 text-left">
              <tr>
                <th className="p-2">Name</th>
                <th className="p-2">Adm No.</th>
                <th className="p-2">Class</th>
                <th className="p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s) => (
                <tr key={s.student_id} className="border-t">
                  <td className="p-2">{s.name}</td>
                  <td className="p-2">{s.admission_number}</td>
                  <td className="p-2">{s.class_name}</td>
                  <td className="p-2 space-x-2">
                    <button
                      className="text-blue-600 hover:underline"
                      onClick={() => alert('Edit form (coming soon)')}
                    >
                      Edit
                    </button>
                    <button
                      className="text-red-600 hover:underline"
                      onClick={() => handleDelete(s.student_id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {students.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-4 text-center text-gray-500">
                    No students found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
  )
}
