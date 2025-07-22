/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from 'react'
import axios from 'axios'

interface RankedStudent {
  student_id: number
  student_name: string
  class_name: string
  average_score: number
  mean_grade: string
  position: number
}

type FormLevels = 'Form 1' | 'Form 2' | 'Form 3' | 'Form 4'

export default function OverallSchoolRankings() {
  const [rankings, setRankings] = useState<Record<FormLevels, RankedStudent[]>>()
  const token = localStorage.getItem('token')
  const headers = { Authorization: `Bearer ${token}` }

  useEffect(() => {
    axios.get('http://localhost:5001/api/v1/reports/school/rankings', { headers })
      .then(res => setRankings(res.data))
      .catch(err => console.error('Failed to load school rankings', err))
  }, [])

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">🏆 School Rankings (All Forms)</h1>
      {rankings ? (
        Object.entries(rankings).map(([form, students]) => (
          <div key={form} className="mb-8">
            <h2 className="text-xl font-semibold mb-2">{form}</h2>
            <table className="w-full border bg-white shadow rounded">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-2 text-left">#</th>
                  <th className="p-2 text-left">Student</th>
                  <th className="p-2 text-left">Class</th>
                  <th className="p-2 text-left">Average</th>
                  <th className="p-2 text-left">Grade</th>
                </tr>
              </thead>
              <tbody>
                {students.map((s) => (
                  <tr key={s.student_id} className="border-t">
                    <td className="p-2">{s.position}</td>
                    <td className="p-2">{s.student_name}</td>
                    <td className="p-2">{s.class_name}</td>
                    <td className="p-2">{s.average_score}</td>
                    <td className="p-2">{s.mean_grade}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))
      ) : (
        <p>Loading rankings...</p>
      )}
    </div>
  )
}
