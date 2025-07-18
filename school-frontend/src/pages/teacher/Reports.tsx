/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from 'react'
import axios from 'axios'
import { saveAs } from 'file-saver'

interface ExamEntry {
  exam: string
  score: number
  term: string
  year: number
}

interface SubjectReport {
  subject_name: string
  average_score: number
  kcse_grade: string
  exams: ExamEntry[]
}

interface StudentReport {
  student_id: number
  student_name: string
  mean_score: number
  kcse_grade: string
  position: number
  subjects: SubjectReport[]
}

interface ClassInfo {
  class_id: number
  class_name: string
}

export default function TeacherClassReport() {
  const [classes, setClasses] = useState<ClassInfo[]>([])
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null)
  const [term, setTerm] = useState('')
  const [year, setYear] = useState('2025')
  const [data, setData] = useState<StudentReport[]>([])
  const [loading, setLoading] = useState(false)

  const token = localStorage.getItem('token')
  const headers = { Authorization: `Bearer ${token}` }

  useEffect(() => {
    axios.get('http://localhost:5001/api/v1/assignments/me', { headers })
      .then(res => setClasses(res.data))
      .catch(err => console.error('Failed to load classes', err))
  }, [])

  const fetchData = async () => {
    if (!selectedClassId) return
    setLoading(true)
    try {
      const res = await axios.get(`http://localhost:5001/api/v1/teacher-reports/grades/${selectedClassId}`, {
        headers,
        params: { term, year }
      })
      setData(res.data)
    } catch (err) {
      console.error('Failed to load report', err)
    } finally {
      setLoading(false)
    }
  }

  const exportFile = async (type: 'csv' | 'pdf') => {
    if (!selectedClassId) return
    const ext = type === 'pdf' ? 'pdf' : 'csv'
    try {
      const res = await axios.get(`http://localhost:5001/api/v1/reports/export/class/${selectedClassId}/${ext}`, {
        headers,
        responseType: 'blob',
      })
      const selectedClass = classes.find(c => c.class_id === selectedClassId)
      saveAs(res.data, `${selectedClass?.class_name ?? 'class'}_report.${ext}`)
    } catch (err) {
      console.error(`${type.toUpperCase()} export failed`, err)
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">📊 Class Performance Report (Subject-wise)</h1>

      {/* Class + Filters */}
      <div className="mb-4 max-w-xl space-y-2">
        <div>
          <label className="block font-medium mb-1">Select Class</label>
          <select
            value={selectedClassId ?? ''}
            onChange={(e) => setSelectedClassId(Number(e.target.value))}
            className="border p-2 rounded w-full"
          >
            <option value="">-- Choose Class --</option>
            {classes.map(cls => (
              <option key={cls.class_id} value={cls.class_id}>
                {cls.class_name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-4">
          <input
            type="text"
            className="border p-2 rounded w-full"
            placeholder="Term (e.g. Term 2)"
            value={term}
            onChange={(e) => setTerm(e.target.value)}
          />
          <input
            type="number"
            className="border p-2 rounded w-full"
            placeholder="Year"
            value={year}
            onChange={(e) => setYear(e.target.value)}
          />
        </div>

        <button
          onClick={fetchData}
          className="bg-blue-600 text-white px-4 py-2 rounded mt-1"
        >
          📥 Load Report
        </button>
      </div>

      {/* Export Buttons */}
      {data.length > 0 && (
        <div className="mb-4 space-x-2">
          <button onClick={() => exportFile('csv')} className="bg-green-600 px-3 py-1 text-white rounded">Export CSV</button>
          <button onClick={() => exportFile('pdf')} className="bg-red-600 px-3 py-1 text-white rounded">Export PDF</button>
        </div>
      )}

      {/* Table */}
      {loading ? (
        <p>Loading...</p>
      ) : (
        data.length > 0 ? (
          <table className="w-full bg-white shadow table-auto rounded">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 text-left">#</th>
                <th className="p-2 text-left">Student</th>
                <th className="p-2 text-left">Mean Score</th>
                <th className="p-2 text-left">Grade</th>
                <th className="p-2 text-left">Position</th>
                <th className="p-2 text-left">Subjects</th>
              </tr>
            </thead>
            <tbody>
              {data.map((s, i) => (
                <tr key={s.student_id} className="border-t align-top">
                  <td className="p-2">{i + 1}</td>
                  <td className="p-2">{s.student_name}</td>
                  <td className="p-2">{s.mean_score}</td>
                  <td className="p-2">{s.kcse_grade}</td>
                  <td className="p-2">{s.position}</td>
                  <td className="p-2 text-sm">
                    {s.subjects.map((sub, j) => (
                      <div key={j} className="mb-2">
                        <div><strong>{sub.subject_name}</strong>: {sub.average_score} ({sub.kcse_grade})</div>
                        {sub.exams.map((e, k) => (
                          <div key={k} className="ml-4 text-xs text-gray-600">
                            📘 {e.exam}: {e.score} ({e.term}, {e.year})
                          </div>
                        ))}
                      </div>
                    ))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-gray-500">No report loaded.</p>
        )
      )}
    </div>
  )
}
