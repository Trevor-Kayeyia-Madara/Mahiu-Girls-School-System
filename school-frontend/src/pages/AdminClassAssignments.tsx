/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react'
import axios from 'axios'
import AdminLayout from '../layouts/AdminLayout'
import type { Teacher, Subject, Classroom, Assignment } from '../types/TeacherSubjectAssignment'

export default function AdminClassAssignments() {
  const [classrooms, setClassrooms] = useState<Classroom[]>([])
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        const [classRes, teacherRes, subjectRes, assignRes] = await Promise.all([
          axios.get('http://localhost:5001/api/v1/classrooms'),
          axios.get('http://localhost:5001/api/v1/staff'),
          axios.get('http://localhost:5001/api/v1/subjects'),
          axios.get('http://localhost:5001/api/v1/teacher-subjects'),
        ])

        setClassrooms(classRes.data)
        setTeachers(teacherRes.data.filter((t: any) => t.role === 'teacher'))
        setSubjects(subjectRes.data)
        setAssignments(assignRes.data)
      } catch (err) {
        console.error('Error loading data', err)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const updateAssignment = (class_id: number, subject_id: number, teacher_id: number) => {
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

  const handleSave = async () => {
    try {
      await axios.post('http://localhost:5001/api/v1/teacher-subjects/bulk', assignments)
      alert('✅ Assignments saved')
    } catch (err) {
      console.error('Failed to save', err)
      alert('❌ Save failed')
    }
  }

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold mb-4">📚 Assign Subject Teachers to Classes</h1>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          {classrooms.map(cls => (
            <div key={cls.class_id} className="bg-white shadow rounded p-4 mb-6">
              <h2 className="text-lg font-semibold mb-3">{cls.class_name}</h2>
              <table className="w-full table-auto border text-sm">
                <thead className="bg-gray-100 text-left">
                  <tr>
                    <th className="p-2">Subject</th>
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
                              updateAssignment(
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
            💾 Save Assignments
          </button>
        </>
      )}
    </AdminLayout>
  )
}
