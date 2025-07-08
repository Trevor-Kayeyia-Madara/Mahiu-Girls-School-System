import { useEffect, useState } from 'react'
import axios from 'axios'
import AdminLayout from '../layouts/AdminLayout'

interface Teacher {
  staff_id: number
  user: { name: string }
  role: string
}

interface Subject {
  subject_id: number
  name: string
  group: string
}

interface Classroom {
  class_id: number
  class_name: string
  class_teacher_id?: number
}

interface Assignment {
  class_id: number
  subject_id: number
  teacher_id: number
}

export default function AdminClassAssignments() {
  const [classrooms, setClassrooms] = useState<Classroom[]>([])
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAll = async () => {
      const [classRes, staffRes, subjectRes, assignRes] = await Promise.all([
        axios.get('http://localhost:5001/api/v1/classrooms'),
        axios.get('http://localhost:5001/api/v1/staff'),
        axios.get('http://localhost:5001/api/v1/subjects'),
        axios.get('http://localhost:5001/api/v1/teacher-subjects')
      ])
      setClassrooms(classRes.data)
      setTeachers(staffRes.data.filter((t: Teacher) => t.role === 'teacher'))
      setSubjects(subjectRes.data)
      setAssignments(assignRes.data)
      setLoading(false)
    }

    fetchAll()
  }, [])

  const updateSubjectAssignment = (class_id: number, subject_id: number, teacher_id: number) => {
    setAssignments(prev => {
      const exists = prev.find(a => a.class_id === class_id && a.subject_id === subject_id)
      if (exists) {
        return prev.map(a =>
          a.class_id === class_id && a.subject_id === subject_id
            ? { ...a, teacher_id }
            : a
        )
      } else {
        return [...prev, { class_id, subject_id, teacher_id }]
      }
    })
  }

  const updateClassTeacher = (class_id: number, teacher_id: number) => {
    setClassrooms(prev =>
      prev.map(c =>
        c.class_id === class_id ? { ...c, class_teacher_id: teacher_id } : c
      )
    )
  }

  const handleSave = async () => {
    try {
      // Save subject teacher assignments
      await axios.post('http://localhost:5001/api/v1/teacher-subjects/bulk', assignments)

      // Save class teacher assignments one by one
      for (const cls of classrooms) {
        await axios.put(`http://localhost:5001/api/v1/classrooms/${cls.class_id}`, {
          class_teacher_id: cls.class_teacher_id
        })
      }

      alert('✅ All assignments saved successfully')
    } catch (err) {
      console.error(err)
      alert('❌ Error saving assignments')
    }
  }

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold mb-4">🏫 Assign Class & Subject Teachers</h1>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          {classrooms.map(cls => (
            <div key={cls.class_id} className="mb-6 border rounded bg-white shadow p-4">
              <h2 className="text-lg font-semibold mb-2">{cls.class_name}</h2>

              {/* Class Teacher */}
              <div className="mb-4">
                <label className="block font-medium mb-1">👩‍🏫 Class Teacher</label>
                <select
                  value={cls.class_teacher_id || ''}
                  onChange={e => updateClassTeacher(cls.class_id, parseInt(e.target.value))}
                  className="border p-2 rounded w-full"
                >
                  <option value="">-- Select Class Teacher --</option>
                  {teachers.map(t => (
                    <option key={t.staff_id} value={t.staff_id}>
                      {t.user.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Subject Teachers */}
              <table className="w-full table-auto text-sm border">
                <thead className="bg-gray-100 text-left">
                  <tr>
                    <th className="p-2">📘 Subject</th>
                    <th className="p-2">Assigned Teacher</th>
                  </tr>
                </thead>
                <tbody>
                  {subjects.map(subj => {
                    const current = assignments.find(
                      a => a.class_id === cls.class_id && a.subject_id === subj.subject_id
                    )
                    return (
                      <tr key={subj.subject_id} className="border-t">
                        <td className="p-2">{subj.name}</td>
                        <td className="p-2">
                          <select
                            value={current?.teacher_id || ''}
                            onChange={e =>
                              updateSubjectAssignment(
                                cls.class_id,
                                subj.subject_id,
                                parseInt(e.target.value)
                              )
                            }
                            className="border p-1 rounded w-full"
                          >
                            <option value="">-- Select --</option>
                            {teachers.map(t => (
                              <option key={t.staff_id} value={t.staff_id}>
                                {t.user.name}
                              </option>
                            ))}
                          </select>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          ))}

          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            💾 Save All Assignments
          </button>
        </>
      )}
    </AdminLayout>
  )
}
