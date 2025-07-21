/* eslint-disable react-hooks/exhaustive-deps */
// src/pages/ParentDashboard.tsx
import { useEffect, useState } from 'react'
import axios from 'axios'

interface Student {
  student_id: number
  first_name: string
  last_name: string
  admission_number: string
  class_name: string
}

export default function ParentDashboard() {
  const [parentName] = useState('') // name not provided, optional
  const [students, setStudents] = useState<Student[]>([])

  const token = localStorage.getItem('token')
  const headers = { Authorization: `Bearer ${token}` }

  useEffect(() => {
    axios.get('http://localhost:5001/api/v1/parents/me/students', { headers })
      .then(res => {
        console.log("Fetched students:", res.data)
        setStudents(res.data)
      })
      .catch(err => console.error('Failed to load students', err))
  }, [])

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">👋 Welcome {parentName || 'Parent'}</h1>

      <h2 className="text-xl font-semibold mb-2">📚 Your Children</h2>
      {students.length > 0 ? (
        <ul className="space-y-2">
          {students.map(child => (
            <li key={child.student_id} className="p-4 bg-white shadow rounded">
              <div><strong>Name:</strong> {child.first_name} {child.last_name}</div>
              <div><strong>Class:</strong> {child.class_name}</div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-600">No linked children yet.</p>
      )}
    </div>
  )
}