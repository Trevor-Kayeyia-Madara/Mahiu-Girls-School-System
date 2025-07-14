/* eslint-disable react-hooks/exhaustive-deps */
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
  date_of_birth: string
  qualifications: string
}

export default function AdminTeachers() {
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null)

  const [currentPage, setCurrentPage] = useState(1)
  const [perPage] = useState(10)
  const [totalPages, setTotalPages] = useState(1)

  const [searchTerm, setSearchTerm] = useState('')
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null)

  const fetchTeachers = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem("token")
      const baseUrl = 'http://localhost:5001/api/v1/teachers'
      const url = searchTerm
        ? `${baseUrl}/search?q=${encodeURIComponent(searchTerm)}`
        : `${baseUrl}?page=${currentPage}&per_page=${perPage}`

      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` }
      })

      setTeachers(res.data.teachers || res.data)
      if (res.data.total) {
        setTotalPages(Math.ceil(res.data.total / perPage))
      }
    } catch (err) {
      console.error('Error fetching teachers:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this teacher?')) return
    try {
      const token = localStorage.getItem("token")
      await axios.delete(`http://localhost:5001/api/v1/teachers/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      fetchTeachers()
    } catch (err) {
      console.error('Error deleting teacher:', err)
    }
  }

  useEffect(() => {
    fetchTeachers()
  }, [currentPage, searchTerm])

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setSearchTerm(val)
    setCurrentPage(1)

    if (searchTimeout) clearTimeout(searchTimeout)

    const timeout = setTimeout(() => {
      fetchTeachers()
    }, 500)

    setSearchTimeout(timeout)
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">👩‍🏫 Manage Teachers</h1>

      <div className="flex items-center gap-4 mb-4">
        <button
          onClick={() => {
            setEditingTeacher(null)
            setShowForm(true)
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          ➕ Add Teacher
        </button>

        <input
          type="text"
          value={searchTerm}
          onChange={handleSearch}
          placeholder="🔍 Search by name, email or emp #"
          className="border px-3 py-2 rounded w-80"
        />
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          <table className="w-full bg-white shadow table-auto rounded">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left">Serial Number</th>
                <th className="text-left p-2">Name</th>
                <th className="text-left p-2">Email</th>
                <th className="text-left p-2">Emp. #</th>
                <th className="text-left p-2">Gender</th>
                <th className="text-left p-2">Contact</th>
                <th className="text-left p-2">Date Of Birth</th>
                <th className="text-left p-2">Qualifications</th>
                <th className="text-left p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {teachers.map((t) => (
                <tr key={t.teacher_id} className="border-t">
                  <td className="px-4 py-2">{t.teacher_id}</td>
                  <td className="p-2">{t.name}</td>
                  <td className="p-2">{t.email}</td>
                  <td className="p-2">{t.employee_number}</td>
                  <td className="p-2">{t.gender}</td>
                  <td className="p-2">{t.contact}</td>
                  <td className="p-2">{t.date_of_birth}</td>
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

          {/* Only show pagination if not searching */}
          {searchTerm === '' && (
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
          )}
        </>
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
