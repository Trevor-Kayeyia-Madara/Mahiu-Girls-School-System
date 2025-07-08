/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import axios from 'axios'
import TeacherLayout from '../layouts/TeacherLayout'

interface Student {
  student_id: number
  name: string
  admission_number: string
}

export default function TeacherGradeEntry() {
  const [students, setStudents] = useState<Student[]>([])
  const [scores, setScores] = useState<Record<number, number>>({})
  const [message, setMessage] = useState('')
  const [searchParams] = useSearchParams()

  const classIdParam = searchParams.get('class_id')
const subjectIdParam = searchParams.get('subject_id')
  const classId = Number(searchParams.get('class_id'))
  const subjectId = Number(searchParams.get('subject_id'))
  const term = 'Term 1'
  const year = 2025

  useEffect(() => {
  if (!classIdParam || !subjectIdParam || isNaN(classId) || isNaN(subjectId)) {
    setMessage('❌ Missing or invalid class_id/subject_id in the URL.')
    return
  }
  fetchStudents()
}, [])


  const fetchStudents = async () => {
    const res = await axios.get(
      `http://localhost:5001/api/v1/grades/class/${classId}/subject/${subjectId}`
    )
    setStudents(res.data)
  }

  const handleChange = (studentId: number, value: string) => {
    setScores({ ...scores, [studentId]: Number(value) })
  }

  const handleSubmit = async () => {
    try {
      for (const student of students) {
        const score = scores[student.student_id]
        if (score !== undefined) {
          await axios.post('http://localhost:5001/api/v1/grades', {
            student_id: student.student_id,
            class_id: classId,
            subject_id: subjectId,
            term,
            year,
            score
          })
        }
      }
      setMessage('✅ Grades submitted successfully')
    } catch (err) {
      console.error(err)
      setMessage('❌ Failed to submit grades')
    }
  }

  useEffect(() => {
    fetchStudents()
  }, [])

  return (
    <TeacherLayout>
      <h1 className="text-2xl font-bold mb-4">📊 Grade Entry</h1>

      <div className="bg-white p-6 rounded shadow">
        <table className="w-full table-auto">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2">Name</th>
              <th className="p-2">Admission #</th>
              <th className="p-2">Score</th>
            </tr>
          </thead>
          <tbody>
            {students.map((s) => (
              <tr key={s.student_id} className="border-t">
                <td className="p-2">{s.name}</td>
                <td className="p-2">{s.admission_number}</td>
                <td className="p-2">
                  <input
                    type="number"
                    value={scores[s.student_id] || ''}
                    onChange={(e) => handleChange(s.student_id, e.target.value)}
                    className="border rounded p-1 w-24"
                    min={0}
                    max={100}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <button
          onClick={handleSubmit}
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          💾 Submit Grades
        </button>

        {message && <p className="text-sm mt-2 text-gray-600">{message}</p>}
      </div>
    </TeacherLayout>
  )
}
