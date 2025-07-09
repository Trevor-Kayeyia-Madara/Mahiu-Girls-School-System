import { useEffect, useState } from 'react'
import axios from 'axios'

interface Staff {
  staff_id: number
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

// interface Assignment {
//   class_id: number
//   subject_id: number
//   teacher_id: number
// }

export default function AdminClassAssignments() {
  const [classrooms, setClassrooms] = useState<Classroom[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [teachers, setTeachers] = useState<Staff[]>([])
  const [assignments, setAssignments] = useState<{
    [classId: number]: {
      class_teacher_id: number | null
      subject_teachers: { [subjectId: number]: number | null }
    }
  }>({})

  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [classRes, subjectRes, teacherRes] = await Promise.all([
          axios.get('/api/v1/classrooms'),
          axios.get('/api/v1/subjects'),
          axios.get('/api/v1/staff/teachers'),
        ])
        setClassrooms(classRes.data)
        setSubjects(subjectRes.data)
        setTeachers(teacherRes.data)

        const initialAssignments: typeof assignments = {}
        for (const cls of classRes.data) {
          const res = await axios.get(`/api/v1/class-assignments/class/${cls.class_id}`)
          const subject_teachers: { [subjectId: number]: number | null } = {}
          const class_teacher_id: number | null = null

          for (const a of res.data) {
            subject_teachers[a.subject_id] = a.teacher_id
          }

          initialAssignments[cls.class_id] = {
            class_teacher_id,
            subject_teachers,
          }
        }

        setAssignments(initialAssignments)
      } catch (error) {
        console.error('Error fetching assignment data', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleChange = (
    classId: number,
    subjectId: number | null,
    teacherId: number | null
  ) => {
    setAssignments((prev) => {
      const updated = { ...prev }
      if (!updated[classId]) return prev

      if (subjectId === null) {
        updated[classId].class_teacher_id = teacherId
      } else {
        updated[classId].subject_teachers[subjectId] = teacherId
      }

      return updated
    })
  }

  const handleSave = async (classId: number) => {
    const data = assignments[classId]
    const subjectUpdates = Object.entries(data.subject_teachers).map(
      ([subjectId, teacherId]) => ({
        class_id: classId,
        subject_id: parseInt(subjectId),
        teacher_id: teacherId,
      })
    )

    try {
      for (const update of subjectUpdates) {
        await axios.post('/api/v1/class-assignments/', update)
      }

      alert('Saved successfully.')
    } catch (err) {
      console.error('Save error:', err)
      alert('Error saving.')
    }
  }

  if (loading) return <p>Loading...</p>

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">📚 Class Assignments</h1>

      {classrooms.map((cls) => (
        <div key={cls.class_id} className="mb-8 p-4 border rounded shadow bg-white">
          <h2 className="text-lg font-semibold mb-3">{cls.class_name}</h2>

          {/* Class Teacher */}
          <div className="mb-4">
            <label className="block mb-1 font-medium">👨‍🏫 Class Teacher</label>
            <select
              value={assignments[cls.class_id]?.class_teacher_id || ''}
              onChange={(e) =>
                handleChange(cls.class_id, null, parseInt(e.target.value) || null)
              }
              className="border p-2 rounded w-full"
            >
              <option value="">-- Select Teacher --</option>
              {teachers.map((t) => (
                <option key={t.staff_id} value={t.staff_id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          {/* Subjects */}
          <table className="w-full border table-auto bg-gray-50">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2 text-left">Subject</th>
                <th className="p-2 text-left">Teacher</th>
              </tr>
            </thead>
            <tbody>
              {subjects.map((subj) => (
                <tr key={`${cls.class_id}-${subj.subject_id}`}>
                  <td className="p-2">{subj.name}</td>
                  <td className="p-2">
                    <select
                      value={
                        assignments[cls.class_id]?.subject_teachers[subj.subject_id] || ''
                      }
                      onChange={(e) =>
                        handleChange(
                          cls.class_id,
                          subj.subject_id,
                          parseInt(e.target.value) || null
                        )
                      }
                      className="border p-2 rounded w-full"
                    >
                      <option value="">-- Select Teacher --</option>
                      {teachers.map((t) => (
                        <option
                          key={`s-${cls.class_id}-${subj.subject_id}-${t.staff_id}`}
                          value={t.staff_id}
                        >
                          {t.name}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <button
            onClick={() => handleSave(cls.class_id)}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
          >
            💾 Save {cls.class_name}
          </button>
        </div>
      ))}
    </div>
  )
}
