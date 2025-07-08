/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react'
import axios from 'axios'

interface Teacher {
  staff_id: number
  user: { name: string }
}

interface Subject {
  subject_id: number
  name: string
}

interface Classroom {
  class_id: number
  class_name: string
  class_teacher_id?: number
}

export default function AdminClassAssignments() {
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [classes, setClasses] = useState<Classroom[]>([])
  const [classTeachers, setClassTeachers] = useState<Record<number, number>>({})
  const [assignments, setAssignments] = useState<Record<string, number>>({})

  useEffect(() => {
    const fetchAll = async () => {
      const [tRes, sRes, cRes] = await Promise.all([
        axios.get('http://localhost:5001/api/v1/staff?role=teacher'),
        axios.get('http://localhost:5001/api/v1/subjects'),
        axios.get('http://localhost:5001/api/v1/classrooms'),
      ])
      setTeachers(tRes.data)
      setSubjects(sRes.data)
      setClasses(cRes.data)

      const ctMap: Record<number, number> = {}
      cRes.data.forEach((cls: Classroom) => {
        if (cls.class_teacher_id) ctMap[cls.class_id] = cls.class_teacher_id
      })
      setClassTeachers(ctMap)
    }

    fetchAll()
  }, [])

  const handleTeacherChange = (classId: number, subjectId: number, teacherId: number) => {
    setAssignments(prev => ({
      ...prev,
      [`${classId}_${subjectId}`]: teacherId
    }))
  }

  const handleClassTeacherChange = (classId: number, teacherId: number) => {
    setClassTeachers(prev => ({
      ...prev,
      [classId]: teacherId
    }))
  }

  const handleSave = async () => {
    try {
      // Save class teacher changes
      for (const classId in classTeachers) {
        await axios.put(`http://localhost:5001/api/v1/classrooms/${classId}`, {
          class_teacher_id: classTeachers[classId]
        })
      }

      // Save subject-teacher assignments
      for (const key in assignments) {
        const [classId, subjectId] = key.split('_').map(Number)
        const teacherId = assignments[key]

        if (teacherId)
          await axios.post('http://localhost:5001/api/v1/teacher-subjects', {
            class_id: classId,
            subject_id: subjectId,
            teacher_id: teacherId
          })
      }

      alert('✅ Assignments saved!')
    } catch (err: any) {
      alert(err.response?.data?.error || '❌ Error saving assignments')
    }
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">🎓 Assign Teachers to Subjects & Classes</h1>

      {classes.map((cls) => (
        <div key={cls.class_id} className="mb-6 bg-white shadow rounded p-4">
          <h2 className="text-lg font-semibold mb-3">{cls.class_name}</h2>

          {/* Class Teacher Assignment */}
          <div className="mb-4">
            <label className="block font-medium mb-1">Class Teacher</label>
            <select
              value={classTeachers[cls.class_id] ?? ''}
              onChange={e =>
                handleClassTeacherChange(cls.class_id, Number(e.target.value))
              }
              className="border p-2 rounded w-full"
            >
              <option value="">Select Teacher</option>
              {teachers.map(t => (
                <option key={`ct-${cls.class_id}-${t.staff_id}`} value={t.staff_id}>
                  {t.user.name}
                </option>
              ))}
            </select>
          </div>

          {/* Subject-Teacher Table */}
          <table className="w-full table-auto border text-left">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2">Subject</th>
                <th className="p-2">Assigned Teacher</th>
              </tr>
            </thead>
            <tbody>
           {subjects.map(subject => {
  if (!subject || typeof subject.subject_id === 'undefined') return null;

  const key = `${cls.class_id}_${subject.subject_id}`

  return (
    <tr key={key}>
      <td className="p-2">{subject.name}</td>
      <td className="p-2">
        <select
          value={assignments[key] ?? ''}
          onChange={e =>
            handleTeacherChange(cls.class_id, subject.subject_id, Number(e.target.value))
          }
          className="border p-1 rounded w-full"
        >
          <option value="">Select Teacher</option>
          {teachers.map(t => (
            <option
              key={`assign-${cls.class_id}-${subject.subject_id}-${t.staff_id}`}
              value={t.staff_id}
            >
              {t.user.name}
            </option>
          ))}
        </select>
      </td>
    </tr>
  );
})}

            </tbody>
          </table>
        </div>
      ))}

      <button
        onClick={handleSave}
        className="mt-4 px-6 py-2 bg-blue-600 text-white rounded"
      >
        💾 Save All Assignments
      </button>
    </div>
  )
}
