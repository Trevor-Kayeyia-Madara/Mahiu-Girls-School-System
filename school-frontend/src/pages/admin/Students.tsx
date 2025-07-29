import { useEffect, useState } from 'react'
import axios from 'axios'
import StudentForm from '../../components/StudentForm'

interface Student {
  student_id: number
  admission_number: string
  first_name: string
  last_name: string
  gender: string
  date_of_birth: string
  parent_name: string
  class_name: string
}

export default function AdminStudents() {
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingStudent, setEditingStudent] = useState<Student | null>(null)

  const [currentPage, setCurrentPage] = useState(1)
  const perPage = 5

  const token = localStorage.getItem('token')

  useEffect(() => {
    const fetchStudents = async () => {
      setLoading(true)
      try {
        const res = await axios.get('http://localhost:5001/api/v1/students', {
          headers: { Authorization: `Bearer ${token}` }
        })
        setStudents(res.data.students || res.data)
      } catch (err) {
        console.error('Failed to load students:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchStudents()
  }, [token])

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this student?')) return
    try {
      await axios.delete(`http://localhost:5001/api/v1/students/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setStudents((prev) => prev.filter((s) => s.student_id !== id))
    } catch (err) {
      console.error('Error deleting student:', err)
    }
  }

  const totalPages = Math.ceil(students.length / perPage)
  const paginated = students.slice((currentPage - 1) * perPage, currentPage * perPage)

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">🎓 Manage Students</h1>
        <button
          onClick={() => {
            setEditingStudent(null)
            setShowForm(true)
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded shadow"
        >
          ➕ Add Student
        </button>
      </div>

      <p className="text-gray-600 mb-3">Total Students: {students.length}</p>

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full bg-white shadow rounded text-sm">
              <thead className="bg-gray-100 text-left">
                <tr>
                  <th className="px-3 py-2">#</th>
                  <th className="px-3 py-2">Admission</th>
                  <th className="px-3 py-2">Name</th>
                  <th className="px-3 py-2">Gender</th>
                  <th className="px-3 py-2">DOB</th>
                  <th className="px-3 py-2">Parent</th>
                  <th className="px-3 py-2">Class</th>
                  <th className="px-3 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((s) => (
                  <tr key={s.student_id} className="border-t hover:bg-gray-50">
                    <td className="px-3 py-2">{s.student_id}</td>
                    <td className="px-3 py-2">{s.admission_number}</td>
                    <td className="px-3 py-2">{s.first_name} {s.last_name}</td>
                    <td className="px-3 py-2">{s.gender}</td>
                    <td className="px-3 py-2">{s.date_of_birth}</td>
                    <td className="px-3 py-2">{s.parent_name}</td>
                    <td className="px-3 py-2">{s.class_name}</td>
                    <td className="px-3 py-2 space-x-2">
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
                        onClick={() => handleDelete(s.student_id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className="flex justify-between items-center mt-4 text-sm">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 bg-gray-200 rounded disabled:opacity-40"
            >
              ⬅ Prev
            </button>
            <span>
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 bg-gray-200 rounded disabled:opacity-40"
            >
              Next ➡
            </button>
          </div>
        </>
      )}

      {showForm && (
        <StudentForm
          student={editingStudent}
          onClose={() => setShowForm(false)}
          onSaved={() => {
            setShowForm(false)
            // Refetch only if needed, or append to students locally
          }}
        />
      )}
    </div>
  )
}
