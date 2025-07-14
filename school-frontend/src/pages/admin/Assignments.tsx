/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from 'react'
import axios from 'axios'

interface Classroom {
  class_id: number
  class_name: string
}

interface Subject {
  subject_id: number
  name: string
}

interface Teacher {
  teacher_id: number
  name: string
}

interface AssignmentMap {
  [subject_id: number]: number | null // subject_id → teacher_id
}

export default function AdminAssignments() {
  const [classrooms, setClassrooms] = useState<Classroom[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [assignments, setAssignments] = useState<{ [class_id: number]: AssignmentMap }>({})
  const [loading, setLoading] = useState(true)

  const token = localStorage.getItem('token')

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [classRes, subjectRes, teacherRes] = await Promise.all([
          axios.get('http://localhost:5001/api/v1/classrooms', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('http://localhost:5001/api/v1/subjects', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('http://localhost:5001/api/v1/teachers', { headers: { Authorization: `Bearer ${token}` } }),
        ])

        setClassrooms(classRes.data)
        setSubjects(subjectRes.data)
        setTeachers(teacherRes.data)

        const initialAssignments: { [class_id: number]: AssignmentMap } = {}

        for (const cls of classRes.data) {
          const res = await axios.get(`http://localhost:5001/api/v1/assignments/class/${cls.class_id}`, {
            headers: { Authorization: `Bearer ${token}` },
          })

          const map: AssignmentMap = {}
          for (const a of res.data) {
            map[a.subject_id] = a.teacher_id
          }

          initialAssignments[cls.class_id] = map
        }

        setAssignments(initialAssignments)
      } catch (err) {
        console.error('Error loading assignment data:', err)
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
        [subject_id]: teacher_id,
      },
    }))
  }

  const handleSave = async (class_id: number) => {
    try {
      const classAssignments = assignments[class_id]

      for (const [subject_id, teacher_id] of Object.entries(classAssignments)) {
        await axios.post(
          `http://localhost:5001/api/v1/assignments/`,
          {
            class_id,
            subject_id: parseInt(subject_id),
            teacher_id,
          },
          { headers: { Authorization: `Bearer ${token}` } }
        )
      }

      alert('✅ Assignments saved successfully.')
    } catch (err) {
      console.error(err)
      alert('❌ Failed to save assignments.')
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">📚 Class Subject Assignments</h1>

      {loading ? (
        <p>Loading...</p>
      ) : (
        classrooms.map((cls) => (
          <div key={cls.class_id} className="mb-8 bg-white p-4 rounded shadow">
            <h2 className="text-lg font-semibold mb-2">{cls.class_name}</h2>

            <table className="w-full table-auto mb-4">
              <thead className="bg-gray-100">
                <tr>
                  <th className="text-left p-2">Subject</th>
                  <th className="text-left p-2">Assigned Teacher</th>
                </tr>
              </thead>
              <tbody>
                {subjects.map((subj) => (
                  <tr key={`${cls.class_id}-${subj.subject_id}`} className="border-t">
                    <td className="p-2">{subj.name}</td>
                    <td className="p-2">
                      <select
                        value={assignments[cls.class_id]?.[subj.subject_id] ?? ''}
                        onChange={(e) =>
                          handleChange(
                            cls.class_id,
                            subj.subject_id,
                            e.target.value ? parseInt(e.target.value) : null
                          )
                        }
                        className="border p-2 rounded w-full"
                      >
                        <option value="">-- Select Teacher --</option>
                        {teachers.map((t) => (
                          <option key={t.teacher_id} value={t.teacher_id}>
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
              className="bg-blue-600 text-white px-4 py-2 rounded"
            >
              💾 Save Assignments for {cls.class_name}
            </button>
          </div>
        ))
      )}
    </div>
  )
}
