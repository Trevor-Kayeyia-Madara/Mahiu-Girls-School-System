import { useEffect, useState } from 'react'
import axios from 'axios'
import TeacherLayout from '../layouts/TeacherLayout'

interface Assignment {
  subject: string
  class: string
  class_id: number
  subject_id: number
}

export default function TeacherDashboard() {
  const [teacherName, setTeacherName] = useState('')
  const [assignments, setAssignments] = useState<Assignment[]>([])

  const fetchDashboard = async () => {
    const res = await axios.get('http://localhost:5001/api/v1/teachers/dashboard')
    setTeacherName(res.data.teacher_name)
    setAssignments(res.data.assigned_classes)
  }

  useEffect(() => {
    fetchDashboard()
  }, [])

  return (
    <TeacherLayout>
      <h1 className="text-2xl font-bold mb-6">Welcome {teacherName}</h1>

      <div className="bg-white p-6 rounded shadow space-y-4">
        <h2 className="text-lg font-semibold">📘 Your Assigned Subjects</h2>
        <ul className="space-y-2">
          {assignments.map((a, idx) => (
            <li key={idx} className="border-b pb-2">
              {a.subject} — {a.class}
              <a
                href={`/teacher/grades?class_id=${a.class_id}&subject_id=${a.subject_id}`}
                className="ml-4 text-blue-600 hover:underline text-sm"
              >
                ➕ Enter Grades
              </a>
            </li>
          ))}
          {assignments.length === 0 && (
            <p className="text-gray-500">No assigned classes yet.</p>
          )}
        </ul>
      </div>
    </TeacherLayout>
  )
}
