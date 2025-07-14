import { useEffect, useState, useCallback } from 'react'
import axios from 'axios'
import StudentForm from '../../components/StudentForm'

interface Student {
  student_id: number
  admission_number: string
  first_name: string
  last_name: string
  gender: string
  date_of_birth: string
  parent_id: number
  class_id: number
}

export default function AdminStudents() {
  const [students, setStudents] = useState<Student[]>([])
  const [allStudents, setAllStudents] = useState<Student[]>([]) // New: all students
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingStudent, setEditingStudent] = useState<Student | null>(null)

  const [currentPage, setCurrentPage] = useState(1)
  const [perPage] = useState(10)
  const [totalPages, setTotalPages] = useState(1)

  const token = localStorage.getItem('token')

  // ✅ Fetch all students initially (unpaginated)
  const fetchAllStudents = useCallback(async () => {
    try {
      const res = await axios.get('http://localhost:5001/api/v1/students', {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = res.data.students || res.data
      setAllStudents(data)
    } catch (err) {
      console.error('Error fetching all students:', err)
    }
  }, [token])

  // ✅ Paginated fetch
  const fetchStudents = useCallback(async () => {
    try {
      setLoading(true)
      const res = await axios.get(
        `http://localhost:5001/api/v1/students?page=${currentPage}&per_page=${perPage}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )
      const data = res.data.students || res.data
      setStudents(data)
      if (res.data.total) {
        setTotalPages(Math.ceil(res.data.total / perPage))
      }
    } catch (err) {
      console.error('Error fetching students:', err)
    } finally {
      setLoading(false)
    }
  }, [currentPage, perPage, token])

  useEffect(() => {
    fetchAllStudents()
  }, [fetchAllStudents])

  useEffect(() => {
    fetchStudents()
  }, [fetchStudents])

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this student?')) return
    try {
      await axios.delete(`http://localhost:5001/api/v1/students/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      fetchStudents()
      fetchAllStudents()
    } catch (err) {
      console.error('Error deleting student:', err)
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">🎓 Manage Students</h1>

      <button
        onClick={() => {
          setEditingStudent(null)
          setShowForm(true)
        }}
        className="mb-4 px-4 py-2 bg-blue-600 text-white rounded"
      >
        ➕ Add Student
      </button>

      {/* Example of using all students count */}
      <p className="mb-2 text-gray-600">Total Students: {allStudents.length}</p>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          <table className="w-full bg-white shadow table-auto rounded">
            <thead className="bg-gray-100">
              <tr>
                <th className="text-left p-2">Admission #</th>
                <th className="text-left p-2">Name</th>
                <th className="text-left p-2">Gender</th>
                <th className="text-left p-2">Guardian</th>
                <th className="text-left p-2">Contact</th>
                <th className="text-left p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.length > 0 ? (
                students.map((s) => (
                  <tr key={s.student_id} className="border-t">
                    <td className="p-2">{s.admission_number}</td>
                    <td className="p-2">{s.first_name} {s.last_name}</td>
                    <td className="p-2">{s.gender}</td>
                    <td className="p-2">{s.parent_id}</td>
                    <td className="p-2">{s.class_id}</td>
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
                        onClick={() => handleDelete(s.student_id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="text-center text-gray-500 p-4">
                    No students found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          <div className="flex justify-center mt-4 space-x-2">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              className="px-3 py-1 bg-gray-300 rounded disabled:opacity-50"
            >
              ⬅ Prev
            </button>
            <span className="px-4 py-1">
              Page {currentPage} of {totalPages}
            </span>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              className="px-3 py-1 bg-gray-300 rounded disabled:opacity-50"
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
            fetchStudents()
            fetchAllStudents()
          }}
        />
      )}
    </div>
  )
}
