// src/pages/ParentDashboard.tsx
import { useEffect, useState } from 'react'
import axios from 'axios'

interface Student {
  student_id: number
  first_name: string
  last_name: string
  class_name: string
}

const API = 'http://localhost:5001/api/v1'

export default function ParentDashboard() {
  const [students, setStudents] = useState<Student[]>([])

  const token = localStorage.getItem('token')
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const headers = { Authorization: `Bearer ${token}` }

  useEffect(() => {
    axios.get(`${API}/parents/me/students`, { headers })
      .then(res => setStudents(res.data))
      .catch(err => console.error('Failed to fetch children', err))
  }, [headers])

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">👪 My Children</h1>

      {students.length > 0 ? (
        <ul className="space-y-4">
          {students.map((s) => (
            <li key={s.student_id} className="border p-4 rounded shadow bg-white">
              <div className="text-lg font-semibold">
                {s.first_name} {s.last_name}
              </div>
              <div className="text-gray-600">Class: {s.class_name}</div>
              {/* 👇 We'll add report buttons here later */}
            </li>
          ))}
        </ul>
      ) : (
        <p>No children linked to this account.</p>
      )}
    </div>
  )
}
