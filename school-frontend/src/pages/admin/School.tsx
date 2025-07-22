""/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from 'react'
import axios from 'axios'
import { saveAs } from 'file-saver'

interface RankedStudent {
  student_id: number
  student_name: string
  class_name: string
  average_score: number
  mean_grade: string
  position: number
  total_marks: number
}

interface FormRanking {
  form_mean: number
  class_means: Record<string, number>
  students: RankedStudent[]
}

type FormLevels = 'Form 1' | 'Form 2' | 'Form 3' | 'Form 4'

type SchoolRankings = Record<FormLevels, FormRanking>

export default function OverallSchoolRankings() {
  const [rankings, setRankings] = useState<SchoolRankings>()
  const token = localStorage.getItem('token')
  const headers = { Authorization: `Bearer ${token}` }

  useEffect(() => {
    axios
      .get('http://localhost:5001/api/v1/reports/school/rankings', { headers })
      .then((res) => setRankings(res.data))
      .catch((err) => console.error('Failed to load school rankings', err))
  }, [])

  const exportToCSV = (form: FormLevels) => {
    const formData = rankings?.[form]
    if (!formData) return

    const rows = [
      ['Position', 'Student Name', 'Class', 'Total Marks', 'Average Score', 'KCSE Grade']
    ]

    formData.students.forEach((s) => {
      rows.push([
        s.position.toString(),
        s.student_name,
        s.class_name,
        s.total_marks.toFixed(2),
        s.average_score.toFixed(2),
        s.mean_grade
      ])
    })

    const csvContent = rows.map((r) => r.join(',')).join('\n')
    const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' })
    saveAs(blob, `${form.replace(' ', '_')}_ranking_report.csv`)
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">🏆 School Rankings (All Forms)</h1>

      {rankings ? (
        Object.entries(rankings).map(([form, data]) => (
          <div key={form} className="mb-10">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-xl font-semibold">{form}</h2>
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1 rounded"
                onClick={() => exportToCSV(form as FormLevels)}
              >
                Export CSV
              </button>
            </div>

            <p className="mb-2">Form Mean Score: <strong>{data.form_mean}</strong></p>

            <div className="overflow-x-auto">
              <table className="w-full border bg-white shadow rounded text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-2 text-left">#</th>
                    <th className="p-2 text-left">Student</th>
                    <th className="p-2 text-left">Class</th>
                    <th className="p-2 text-left">Total Marks</th>
                    <th className="p-2 text-left">Average</th>
                    <th className="p-2 text-left">Grade</th>
                  </tr>
                </thead>
                <tbody>
                  {data.students.map((s) => (
                    <tr key={s.student_id} className="border-t">
                      <td className="p-2">{s.position}</td>
                      <td className="p-2">{s.student_name}</td>
                      <td className="p-2">{s.class_name}</td>
                      <td className="p-2">{s.total_marks}</td>
                      <td className="p-2">{s.average_score}</td>
                      <td className="p-2">{s.mean_grade}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))
      ) : (
        <p>Loading rankings...</p>
      )}
    </div>
  )
}
