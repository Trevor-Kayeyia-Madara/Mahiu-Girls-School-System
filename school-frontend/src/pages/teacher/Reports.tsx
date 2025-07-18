/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from 'react'
import axios from 'axios'
import { saveAs } from 'file-saver'

interface StudentReport {
  student_id: number
  student_name: string
  average_score: number
  mean_grade: string
  position: number
}

interface ClassInfo {
  class_id: number
  class_name: string
}

export default function TeacherClassReport() {
  const [classes, setClasses] = useState<ClassInfo[]>([])
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null)
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
      const res = await axios.get(`http://localhost:5001/api/v1/reports/class/${selectedClassId}`, { headers })
      setData(res.data.students)
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
      <h1 className="text-xl font-bold mb-4">📊 Class Performance Report</h1>

      {/* Class Selector */}
      <div className="mb-4 max-w-sm">
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
        <button
          onClick={fetchData}
          className="mt-2 bg-blue-600 text-white px-4 py-2 rounded"
        >
          📥 Load Report
        </button>
      </div>

      {/* Action Buttons */}
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
              </tr>
            </thead>
            <tbody>
              {data.map((s, i) => (
                <tr key={s.student_id} className="border-t">
                  <td className="p-2">{i + 1}</td>
                  <td className="p-2">{s.student_name}</td>
                  <td className="p-2">{s.average_score}</td>
                  <td className="p-2">{s.mean_grade}</td>
                  <td className="p-2">{s.position}</td>
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
