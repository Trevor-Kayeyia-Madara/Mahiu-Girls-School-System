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

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const res = await axios.get('http://localhost:5001/api/v1/classrooms', { headers })
        setClasses(Array.isArray(res.data) ? res.data : [])
      } catch (err) {
        console.error('Error loading classes', err)
      }
    }

    fetchClasses()
  }, [headers])

  useEffect(() => {
    if (!selectedClassId) return

    const fetchStudents = async () => {
      try {
        const res = await axios.get(`http://localhost:5001/api/v1/students/class/${selectedClassId}`, { headers })
        setStudents(Array.isArray(res.data) ? res.data : [])
      } catch (err) {
        console.error('Error loading students', err)
      }
    }

    fetchStudents()
  }, [selectedClassId, headers])

  const exportClassPDF = async () => {
    try {
      const res = await axios.get(`http://localhost:5001/api/v1/reports/export/class/${selectedClassId}/pdf`, {
        headers,
        responseType: 'blob',
      })
      saveAs(res.data, `class_${selectedClassId}_report.pdf`)
    } catch (err) {
      console.error('PDF export failed', err)
    }
  }

  const exportClassCSV = async () => {
    try {
      const res = await axios.get(`http://localhost:5001/api/v1/reports/export/class/${selectedClassId}/csv`, {
        headers,
        responseType: 'blob',
      })
      saveAs(res.data, `class_${selectedClassId}_report.csv`)
    } catch (err) {
      console.error('CSV export failed', err)
    }
  }

  const exportStudentPDF = async () => {
    try {
      const res = await axios.get(`http://localhost:5001/api/v1/reports/export/student/${selectedStudentId}/pdf`, {
        headers,
        responseType: 'blob',
      })
      saveAs(res.data, `student_${selectedStudentId}_report.pdf`)
    } catch (err) {
      console.error('Student PDF export failed', err)
    }
  }

  const exportStudentCSV = async () => {
    try {
      const res = await axios.get(`http://localhost:5001/api/v1/reports/export/student/${selectedStudentId}/csv`, {
        headers,
        responseType: 'blob',
      })
      saveAs(res.data, `student_${selectedStudentId}_report.csv`)
    } catch (err) {
      console.error('Student CSV export failed', err)
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">📊 Admin Reports</h1>

      <div className="mb-4 space-y-2">
        <div>
          <label className="block font-medium mb-1">Select Class</label>
          <select
            value={selectedClassId ?? ''}
            onChange={(e) => {
              setSelectedClassId(Number(e.target.value) || null)
              setSelectedStudentId(null)
              setShowStudentModal(false)
            }}
            className="border p-2 rounded w-full max-w-md"
          >
            <option value="">-- Select Class --</option>
            {classes.map((cls) => (
              <option key={cls.class_id} value={cls.class_id}>
                {cls.class_name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block font-medium mb-1">Select Student</label>
          <select
            value={selectedStudentId ?? ''}
            onChange={(e) => {
              const id = Number(e.target.value)
              setSelectedStudentId(id || null)
              setShowStudentModal(!!id)
            }}
            disabled={!selectedClassId}
            className="border p-2 rounded w-full max-w-md"
          >
            <option value="">-- Select Student --</option>
            {students.map((s) => (
              <option key={s.student_id} value={s.student_id}>
                {s.first_name} {s.last_name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {selectedClassId && (
        <div className="space-x-3 mb-4">
          <button onClick={exportClassPDF} className="bg-red-600 text-white px-4 py-2 rounded">
            ⬇ Export Class PDF
          </button>
          <button onClick={exportClassCSV} className="bg-green-600 text-white px-4 py-2 rounded">
            ⬇ Export Class CSV
          </button>
        </div>
      )}

      {selectedStudentId && (
        <div className="space-x-3 mb-4">
          <button onClick={exportStudentPDF} className="bg-blue-600 text-white px-4 py-2 rounded">
            ⬇ Export Student PDF
          </button>
          <button onClick={exportStudentCSV} className="bg-purple-600 text-white px-4 py-2 rounded">
            ⬇ Export Student CSV
          </button>
        </div>
      )}

      {showStudentModal && selectedStudentId && (
        <StudentReportModal
          studentId={selectedStudentId}
          onClose={() => {
            setShowStudentModal(false)
            setSelectedStudentId(null)
          }}
        />
      )}
    </div>
  )
}
