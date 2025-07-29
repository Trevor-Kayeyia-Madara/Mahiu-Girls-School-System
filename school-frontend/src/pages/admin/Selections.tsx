/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from 'react'
import axios from 'axios'

interface Student {
  student_id: number
  first_name: string
  last_name: string
  class_id: number
  classroom?: {
    form_level: string
  }
}

interface Subject {
  subject_id: number
  name: string
  group: string
  compulsory: boolean
}

export default function AdminStudentSubjectSelection() {
  const [students, setStudents] = useState<Student[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null)
  const [selectedSubjectIds, setSelectedSubjectIds] = useState<number[]>([])
  const token = localStorage.getItem("token")

  useEffect(() => {
    const fetchData = async () => {
      const [studentRes, subjectRes] = await Promise.all([
        axios.get('http://localhost:5001/api/v1/students', {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get('http://localhost:5001/api/v1/subjects', {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ])

      // Filter students in Form 3 & 4 only
      const filtered = studentRes.data.filter((s: Student) => 
        s.classroom?.form_level === 'Form 3' || s.classroom?.form_level === 'Form 4'
      )

      setStudents(filtered)
      setSubjects(subjectRes.data)
    }

    fetchData()
  }, [])

  const handleCheckboxChange = (subjectId: number) => {
    setSelectedSubjectIds(prev =>
      prev.includes(subjectId) ? prev.filter(id => id !== subjectId) : [...prev, subjectId]
    )
  }

  const handleSubmit = async () => {
    if (!selectedStudentId || selectedSubjectIds.length === 0) {
      alert('Please select a student and at least one subject.')
      return
    }

    try {
      await axios.post('http://localhost:5001/select-subjects', {
        student_id: selectedStudentId,
        subject_ids: selectedSubjectIds
      }, {
        headers: { Authorization: `Bearer ${token}` }
      })

      alert('Subjects assigned successfully.')
      setSelectedSubjectIds([])
      setSelectedStudentId(null)
    } catch (err) {
      console.error(err)
      alert('Failed to assign subjects.')
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">📚 Assign Subjects to Students</h1>

      <div className="bg-white rounded shadow p-4 mb-6">
        <label className="block mb-2 font-semibold">Select Student (Form 3 & 4):</label>
        <select
          value={selectedStudentId || ''}
          onChange={(e) => setSelectedStudentId(parseInt(e.target.value))}
          className="w-full p-2 border rounded mb-4"
        >
          <option value="">-- Select Student --</option>
          {students.map(s => (
            <option key={s.student_id} value={s.student_id}>
              {s.first_name} {s.last_name}
            </option>
          ))}
        </select>

        <label className="block mb-2 font-semibold">Select Subjects:</label>
        <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto mb-4">
          {subjects.map(sub => (
            <label key={sub.subject_id} className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={selectedSubjectIds.includes(sub.subject_id)}
                onChange={() => handleCheckboxChange(sub.subject_id)}
              />
              <span>{sub.name} ({sub.group})</span>
            </label>
          ))}
        </div>

        <button onClick={handleSubmit} className="bg-green-600 text-white px-4 py-2 rounded">
          ✅ Assign Subjects
        </button>
      </div>
    </div>
  )
}
