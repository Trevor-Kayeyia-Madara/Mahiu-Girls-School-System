/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState, useMemo } from 'react'
import axios from 'axios'
import { saveAs } from 'file-saver'
import StudentReportModal from '../../components/StudentReportModal'

interface Classroom {
  class_id: number
  class_name: string
}

interface Student {
  student_id: number
  first_name: string
  last_name: string
}

export default function AdminReports() {
  const [classes, setClasses] = useState<Classroom[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null)
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null)
  const [showStudentModal, setShowStudentModal] = useState(false)

  const token = localStorage.getItem('token')
  const headers = useMemo(() => ({ Authorization: `Bearer ${token}` }), [token])

  // Fetch classrooms
  useEffect(() => {
    axios.get('http://localhost:5001/api/v1/classrooms', { headers })
      .then(res => setClasses(res.data || []))
      .catch(err => console.error('Error loading classes', err))
  }, [])

  // Fetch students when class changes
  useEffect(() => {
    if (!selectedClassId) return
    axios.get(`http://localhost:5001/api/v1/students/class/${selectedClassId}`, { headers })
      .then(res => setStudents(res.data || []))
      .catch(err => console.error('Error loading students', err))
  }, [selectedClassId])

  const handleExport = async (type: 'class' | 'student', format: 'pdf' | 'csv') => {
    const id = type === 'class' ? selectedClassId : selectedStudentId
    if (!id) return

    try {
      const res = await axios.get(
        `http://localhost:5001/api/v1/reports/export/${type}/${id}/${format}`,
        { headers, responseType: 'blob' }
      )
      saveAs(res.data, `${type}_${id}_report.${format}`)
    } catch (err) {
      console.error(`${type} ${format.toUpperCase()} export failed`, err)
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">📊 Admin Reports Dashboard</h1>

      {/* Class Selection */}
      <div className="mb-6 bg-gray-50 p-4 rounded shadow">
        <label className="block font-medium mb-2">Select Class</label>
        <select
          value={selectedClassId?.toString() || ''}
          onChange={(e) => {
            const id = parseInt(e.target.value)
            setSelectedClassId(isNaN(id) ? null : id)
            setSelectedStudentId(null)
          }}
          className="border border-gray-300 p-2 rounded w-full"
        >
          <option value="">-- Select Class --</option>
          {classes.map(cls => (
            <option key={cls.class_id} value={cls.class_id}>
              {cls.class_name}
            </option>
          ))}
        </select>

        {selectedClassId && (
          <div className="mt-4 flex gap-3">
            <button
              onClick={() => handleExport('class', 'pdf')}
              className="bg-red-600 text-white px-4 py-2 rounded"
            >
              ⬇ Export PDF
            </button>
            <button
              onClick={() => handleExport('class', 'csv')}
              className="bg-green-600 text-white px-4 py-2 rounded"
            >
              ⬇ Export CSV
            </button>
          </div>
        )}
      </div>

      {/* Student Selection */}
      {selectedClassId && (
        <div className="bg-gray-50 p-4 rounded shadow">
          <h2 className="text-lg font-semibold mb-2">🎓 Student Report</h2>
          <label className="block font-medium mb-2">Select Student</label>
          <select
            value={selectedStudentId?.toString() || ''}
            onChange={(e) => {
              const id = parseInt(e.target.value)
              setSelectedStudentId(isNaN(id) ? null : id)
            }}
            className="border border-gray-300 p-2 rounded w-full"
          >
            <option value="">-- Select Student --</option>
            {students.map((s) => (
              <option key={s.student_id} value={s.student_id}>
                {s.first_name} {s.last_name}
              </option>
            ))}
          </select>

          {selectedStudentId && (
            <div className="mt-4 flex flex-col gap-3">
              <div className="flex gap-3">
                <button
                  onClick={() => handleExport('student', 'pdf')}
                  className="bg-blue-600 text-white px-4 py-2 rounded"
                >
                  ⬇ Export Student PDF
                </button>
                <button
                  onClick={() => handleExport('student', 'csv')}
                  className="bg-purple-600 text-white px-4 py-2 rounded"
                >
                  ⬇ Export Student CSV
                </button>
              </div>
              <button
                onClick={() => setShowStudentModal(true)}
                className="text-sm text-blue-500 underline mt-2 self-start"
              >
                View Detailed Report
              </button>
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      {showStudentModal && selectedStudentId && (
        <StudentReportModal
          studentId={selectedStudentId}
          onClose={() => setShowStudentModal(false)}
        />
      )}
    </div>
  )
}
