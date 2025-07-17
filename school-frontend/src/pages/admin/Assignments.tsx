/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react'
import axios from 'axios'

interface Teacher {
  teacher_id: number
  name: string
}

interface Subject {
  subject_id: number
  name: string
}

interface Classroom {
  class_id: number
  class_name: string
}

interface Assignment {
  [subject_id: number]: number | null
}

export default function AdminAssignments() {
  const [classrooms, setClassrooms] = useState<Classroom[]>([])
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [assignments, setAssignments] = useState<{ [class_id: number]: Assignment }>({})
  const [message, setMessage] = useState('')
  const [filter, setFilter] = useState<number | 'all'>('all')
  const [loading, setLoading] = useState(true)
  const [subjectsList, setSubjectsList] = useState<Subject[]>([])

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 4

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token')
      try {
        const [classRes, subjectRes, teacherRes] = await Promise.all([
          axios.get('http://localhost:5001/api/v1/classrooms', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('http://localhost:5001/api/v1/subjects', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('http://localhost:5001/api/v1/teachers', { headers: { Authorization: `Bearer ${token}` } })
        ])

        const classroomData = Array.isArray(classRes.data)
          ? classRes.data
          : classRes.data?.data ?? []

        setClassrooms(classroomData)
        setSubjectsList(subjectRes.data || [])
        setTeachers(teacherRes.data || [])

        const assignmentsMap: { [class_id: number]: Assignment } = {}

        for (const classroom of classroomData) {
          try {
            const res = await axios.get(
              `http://localhost:5001/api/v1/assignments/class/${classroom.class_id}`,
              { headers: { Authorization: `Bearer ${token}` } }
            )
            const subjectAssignments: Assignment = {}
            for (const item of res.data) {
              subjectAssignments[item.subject_id] = item.teacher_id
            }
            assignmentsMap[classroom.class_id] = subjectAssignments
          } catch (err) {
            console.error(`Failed to load assignments for class ${classroom.class_id}`, err)
          }
        }

        setAssignments(assignmentsMap)
      } catch (err: any) {
        console.error('Error loading data:', err.response?.data || err.message || err)
        setClassrooms([])
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleChange = (class_id: number, subject_id: number, teacher_id: number | null) => {
    setAssignments((prev) => ({
      ...prev,
      [class_id]: {
        ...prev[class_id],
        [subject_id]: teacher_id
      }
    }))
  }

  const handleSave = async (class_id: number) => {
    const token = localStorage.getItem('token')
    try {
      const subject_teachers = assignments[class_id]
      for (const [subject_id, teacher_id] of Object.entries(subject_teachers)) {
        await axios.post(
          `http://localhost:5001/api/v1/assignments/`,
          {
            class_id,
            subject_id: Number(subject_id),
            teacher_id
          },
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        )
      }
      setMessage(`✅ Assignments for ${classrooms.find(c => c.class_id === class_id)?.class_name} saved`)
      setTimeout(() => setMessage(''), 3000)
    } catch (err) {
      console.error(err)
      setMessage('❌ Error saving assignments.')
    }
  }

  const handleDelete = async (class_id: number, subject_id: number) => {
    const token = localStorage.getItem('token')
    try {
      await axios.delete(
        `http://localhost:5001/api/v1/assignments/class/${class_id}/subject/${subject_id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )

      setAssignments((prev) => {
        const updated = { ...prev }
        if (updated[class_id]) {
          delete updated[class_id][subject_id]
        }
        return updated
      })
      setMessage('🗑 Assignment deleted.')
      setTimeout(() => setMessage(''), 3000)
    } catch (err) {
      console.error(err)
      setMessage('❌ Error deleting assignment.')
    }
  }

  // Filter and paginate
  const filteredClassrooms =
    filter === 'all' ? classrooms : classrooms.filter((c) => c.class_id === filter)

  const totalPages = Math.ceil(filteredClassrooms.length / itemsPerPage)
  const paginatedClassrooms = filteredClassrooms.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">📚 Class Assignments</h1>

      {message && <p className="mb-4 text-green-600 font-medium">{message}</p>}

      {/* Filter */}
      <div className="mb-4">
        <label className="mr-2 font-semibold">Filter by Class:</label>
        <select
          value={filter}
          onChange={(e) => {
            setFilter(e.target.value === 'all' ? 'all' : parseInt(e.target.value))
            setCurrentPage(1)
          }}
          className="border rounded px-2 py-1"
        >
          <option value="all">All Classes</option>
          {classrooms.map((cls) => (
            <option key={cls.class_id} value={cls.class_id}>
              {cls.class_name}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : paginatedClassrooms.length > 0 ? (
        paginatedClassrooms.map((cls) => (
          <div key={cls.class_id} className="mb-6 p-4 border rounded bg-white shadow">
            <h2 className="text-lg font-semibold mb-2">{cls.class_name}</h2>
            <table className="w-full table-auto border mb-2">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-2 text-left">Subject</th>
                  <th className="p-2 text-left">Assigned Teacher</th>
                  <th className="p-2 text-left">Action</th>
                </tr>
              </thead>
              <tbody>
                {subjectsList.map((subj) => (
                  <tr key={`${cls.class_id}-${subj.subject_id}`}>
                    <td className="p-2">{subj.name}</td>
                    <td className="p-2">
                      <select
                        value={assignments[cls.class_id]?.[subj.subject_id] || ''}
                        onChange={(e) =>
                          handleChange(
                            cls.class_id,
                            subj.subject_id,
                            e.target.value ? parseInt(e.target.value) : null
                          )
                        }
                        className="border rounded px-2 py-1 w-full"
                      >
                        <option value="">-- Select Teacher --</option>
                        {teachers.map((t) => (
                          <option key={t.teacher_id} value={t.teacher_id}>
                            {t.name}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="p-2">
                      <button
                        className="text-red-600 hover:underline text-sm"
                        onClick={() => handleDelete(cls.class_id, subj.subject_id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <button
              onClick={() => handleSave(cls.class_id)}
              className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              💾 Save {cls.class_name}
            </button>
          </div>
        ))
      ) : (
        <p className="text-gray-600">No classrooms available to display.</p>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-6 space-x-4">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            className={`px-4 py-2 rounded ${
              currentPage === 1 ? 'bg-gray-300 text-gray-500' : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            ⬅ Previous
          </button>

          <span className="font-semibold">
            Page {currentPage} of {totalPages}
          </span>

          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            className={`px-4 py-2 rounded ${
              currentPage === totalPages
                ? 'bg-gray-300 text-gray-500'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            Next ➡
          </button>
        </div>
      )}
    </div>
  )
}
