import { useEffect, useState } from 'react'
import axios from 'axios'
import StudentForm from '../components/StudentForm'

interface Student {
  id: number
  name: string
  email: string
  admission_number: string
  class_id: number
}

export default function AdminStudents() {
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingStudent, setEditingStudent] = useState<Student | null>(null)

  const fetchStudents = async () => {
    const res = await axios.get('http://localhost:5001/api/v1/students')
    setStudents(res.data)
    setLoading(false)
  }

  useEffect(() => {
    fetchStudents()
  }, [])

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this student?')) return
    await axios.delete(`http://localhost:5001/api/v1/students/${id}`)
    fetchStudents()
  }

  return (
      <div>
        <h1 className="text-2xl font-bold mb-4">👥 Manage Students</h1>

        <button
          onClick={() => {
            setEditingStudent(null)
            setShowForm(true)
          }}
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
                <th className="p-2">Email</th>
                <th className="p-2">Admission #</th>
                <th className="p-2">Class</th>
                <th className="p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s) => (
                <tr key={s.id} className="border-t">
                  <td>{s.name}</td>
                    <td>{s.email}</td>
                    <td>{s.admission_number}</td>
                    <td>{s.class_id}</td> {/* or use a mapping to class name */}
                  <td className="p-2 space-x-2">
                    <button
                      className="text-blue-600 hover:underline"
                      onClick={() => {
                        setEditingStudent(s)
                        setShowForm(true)
                      }}
                    >
                      Edit
                    </button>
                    <button
                      className="text-red-600 hover:underline"
                      onClick={() => handleDelete(s.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {students.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-4 text-center text-gray-500">
                    No students found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}

        {/* Modal Form */}
        {showForm && (
          <StudentForm
            student={editingStudent}
            onClose={() => setShowForm(false)}
            onSaved={fetchStudents}
          />
        )}
      </div>
  )
}
