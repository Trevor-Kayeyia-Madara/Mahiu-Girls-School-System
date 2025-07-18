/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react'
import axios from 'axios'
import toast, { Toaster } from 'react-hot-toast'

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

interface TeacherSubject {
  teacher_id: number
  teacher_name: string
  subject_id: number
  subject_name: string
}

export default function AdminAssignments() {
  const [classrooms, setClassrooms] = useState<Classroom[]>([])
  const [subjectsList, setSubjectsList] = useState<Subject[]>([])
  const [assignments, setAssignments] = useState<{ [class_id: number]: Assignment }>({})
  const [teacherSubjects, setTeacherSubjects] = useState<TeacherSubject[]>([])
  const [filter, setFilter] = useState<number | 'all'>('all')
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 4

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token')
      try {
        const [classRes, subjectRes, teacherSubjRes] = await Promise.all([
          axios.get('http://localhost:5001/api/v1/classrooms', {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get('http://localhost:5001/api/v1/subjects', {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get('http://localhost:5001/api/v1/teacher-subjects', {
            headers: { Authorization: `Bearer ${token}` }
          })
        ])

        const classroomData = Array.isArray(classRes.data) ? classRes.data : classRes.data?.data ?? []
        setClassrooms(classroomData)
        setSubjectsList(subjectRes.data || [])
        setTeacherSubjects(teacherSubjRes.data || [])

        const assignmentsMap: { [class_id: number]: Assignment } = {}
        for (const classroom of classroomData) {
          const res = await axios.get(
            `http://localhost:5001/api/v1/assignments/class/${classroom.class_id}`,
            { headers: { Authorization: `Bearer ${token}` } }
          )
          const subjectAssignments: Assignment = {}
          for (const item of res.data) {
            subjectAssignments[item.subject_id] = item.teacher_id
          }
          assignmentsMap[classroom.class_id] = subjectAssignments
        }

        setAssignments(assignmentsMap)
      } catch (err: any) {
        console.error('Error loading data:', err.response?.data || err.message || err)
        toast.error('Failed to fetch assignment data.')
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
          { headers: { Authorization: `Bearer ${token}` } }
        )
      }
      toast.success(`Saved assignments for ${classrooms.find(c => c.class_id === class_id)?.class_name}`)
    } catch {
      toast.error('Failed to save assignments.')
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
        if (updated[class_id]) delete updated[class_id][subject_id]
        return updated
      })
      toast.success('Assignment deleted.')
    } catch {
      toast.error('Failed to delete assignment.')
    }
  }

  const getEligibleTeachers = (subject_id: number) => {
    const eligible = teacherSubjects
      .filter((ts) => ts.subject_id === subject_id)
      .map((ts) => ({ teacher_id: ts.teacher_id, name: ts.teacher_name }))

    return Array.from(new Map(eligible.map(t => [t.teacher_id, t])).values())
  }

  const filteredClassrooms =
    filter === 'all' ? classrooms : classrooms.filter((c) => c.class_id === filter)

  const totalPages = Math.ceil(filteredClassrooms.length / itemsPerPage)
  const paginatedClassrooms = filteredClassrooms.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <Toaster position="top-center" />
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-blue-800">📚 Class Subject Assignments</h1>
        <p className="text-sm text-gray-600 mt-1">Assign teachers to their respective subjects per class.</p>
        <p className="mt-2 text-blue-700 font-medium">Would you like to <span className="underline cursor-pointer">add a new subject?</span></p>
      </div>

      <div className="mb-6">
        <label className="text-sm font-semibold text-gray-700 mr-2">Filter Class:</label>
        <select
          value={filter}
          onChange={(e) => {
            setFilter(e.target.value === 'all' ? 'all' : parseInt(e.target.value))
            setCurrentPage(1)
          }}
          className="border rounded px-3 py-1 bg-white shadow-sm"
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
        <div className="flex justify-center py-10">
          <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-blue-600 border-opacity-50" />
        </div>
      ) : paginatedClassrooms.length > 0 ? (
        paginatedClassrooms.map((cls) => (
          <div
            key={cls.class_id}
            className="mb-8 bg-white rounded shadow border border-gray-200 p-6 transition hover:shadow-lg"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">{cls.class_name}</h2>
              <button
                onClick={() => handleSave(cls.class_id)}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
              >
                💾 Save
              </button>
            </div>

            <table className="w-full table-auto border-collapse text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border px-3 py-2 text-left">Subject</th>
                  <th className="border px-3 py-2 text-left">Assigned Teacher</th>
                  <th className="border px-3 py-2 text-left">Action</th>
                </tr>
              </thead>
              <tbody>
                {subjectsList.map((subj) => {
                  const assigned = assignments[cls.class_id]?.[subj.subject_id]
                  return (
                    <tr key={`${cls.class_id}-${subj.subject_id}`} className="hover:bg-gray-50 border-t">
                      <td className="px-3 py-2 font-medium">{subj.name}</td>
                      <td className="px-3 py-2">
                        <select
                          value={assigned || ''}
                          onChange={(e) =>
                            handleChange(
                              cls.class_id,
                              subj.subject_id,
                              e.target.value ? parseInt(e.target.value) : null
                            )
                          }
                          className="w-full border rounded px-2 py-1"
                        >
                          <option value="">-- Select Teacher --</option>
                          {getEligibleTeachers(subj.subject_id).map((t) => (
                            <option key={t.teacher_id} value={t.teacher_id}>
                              {t.name}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-3 py-2">
                        {assigned ? (
                          <span className="text-green-600 text-sm font-semibold">✅ Assigned</span>
                        ) : (
                          <button
                            onClick={() => handleDelete(cls.class_id, subj.subject_id)}
                            className="text-red-500 hover:underline text-sm"
                          >
                            Delete
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ))
      ) : (
        <p className="text-center text-gray-600">No classrooms available.</p>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center mt-8 space-x-4">
          <button
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            className={`px-4 py-2 rounded ${
              currentPage === 1
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            ⬅ Previous
          </button>

          <span className="text-gray-700 font-medium">
            Page {currentPage} of {totalPages}
          </span>

          <button
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
            className={`px-4 py-2 rounded ${
              currentPage === totalPages
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
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
