/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState, useCallback } from 'react'
import axios from 'axios'

interface Subject {
  subject_id: number
  name: string
  class_id: number
  class_name: string
  form_level?: string
}

interface Student {
  student_id: number
  first_name: string
  last_name: string
}

interface Exam {
  exam_id: number
  name: string
  term: string
  year: number
}

interface GradeView {
  student_name: string
  score: number
}

type ViewMode = 'entry' | 'view'
const API = 'http://localhost:5001/api/v1'

export default function TeacherGrades() {
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [selectedSubjectId, setSelectedSubjectId] = useState<number | null>(null)
  const [students, setStudents] = useState<Student[]>([])
  const [grades, setGrades] = useState<{ [id: number]: number | '' }>({})
  const [exams, setExams] = useState<Exam[]>([])
  const [selectedExamId, setSelectedExamId] = useState<number | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>('entry')
  const [existingGrades, setExistingGrades] = useState<GradeView[]>([])

  const token = localStorage.getItem('token')
  const headers = { Authorization: `Bearer ${token}` }

  const selectedSubject = subjects.find(s => s.subject_id === selectedSubjectId)
  const selectedExam = exams.find(e => e.exam_id === selectedExamId)

  useEffect(() => {
    axios.get(`${API}/teacher-subjects/me`, { headers })
      .then(res => setSubjects(Array.isArray(res.data) ? res.data : []))
      .catch(err => {
        console.error('Failed to load subjects', err)
        setSubjects([])
      })
  }, [])

  const fetchStudents = useCallback(async (classId: number) => {
    try {
      const { data } = await axios.get(`${API}/students/class/${classId}`, { headers })
      setStudents(data)
      const initial: { [id: number]: number | '' } = {}
      data.forEach((s: Student) => (initial[s.student_id] = ''))
      setGrades(initial)
    } catch (err) {
      console.error('Failed to fetch students', err)
    }
  }, [headers])

  const fetchExams = useCallback(async (classId: number, subjectId: number) => {
    try {
      const { data } = await axios.get(`${API}/exams/class/${classId}/subject/${subjectId}`, { headers })
      setExams(data)
      setSelectedExamId(data[0]?.exam_id ?? null)
    } catch (err) {
      console.error('Failed to fetch exams', err)
      setExams([])
    }
  }, [headers])

  const loadData = async () => {
    if (!selectedSubject) return
    await fetchStudents(selectedSubject.class_id)
    await fetchExams(selectedSubject.class_id, selectedSubject.subject_id)
  }

  const handleSubmitGrades = async () => {
    if (!selectedExamId || !selectedSubject) return alert('Select subject and exam first.')

    const payload = Object.entries(grades)
      .filter(([, v]) => v !== '')
      .map(([id, score]) => ({
        student_id: parseInt(id),
        score,
        class_id: selectedSubject.class_id,
        subject_id: selectedSubject.subject_id,
        exam_id: selectedExamId
      }))

    try {
      await axios.post(`${API}/grades/bulk`, payload, { headers })
      alert('✅ Grades submitted successfully')
    } catch (err) {
      console.error('Error submitting grades', err)
      alert('❌ Failed to submit grades')
    }
  }

  const handleCreateExam = async () => {
    if (!selectedSubject) return

    const name = prompt('Enter exam name (e.g. CAT 2):')?.trim()
    const term = prompt('Enter term (e.g. Term 2):')?.trim()
    const year = prompt('Enter year (e.g. 2025):')?.trim()

    if (!name || !term || !year) return alert('All fields are required.')

    try {
      await axios.post(`${API}/exams`, {
        name, term, year,
        subject_id: selectedSubject.subject_id,
        class_id: selectedSubject.class_id
      }, { headers })

      alert('✅ Exam created')
      fetchExams(selectedSubject.class_id, selectedSubject.subject_id)
    } catch (err) {
      console.error('Failed to create exam', err)
      alert('❌ Exam creation failed')
    }
  }

  const handleViewGrades = async () => {
    if (!selectedExamId || !selectedSubject) return

    try {
      const { data } = await axios.get(
        `${API}/grades/class/${selectedSubject.class_id}/subject/${selectedSubject.subject_id}/exam/${selectedExamId}`,
        { headers }
      )
      setExistingGrades(data)
    } catch (err) {
      console.error('Failed to view grades', err)
      setExistingGrades([])
    }
  }

  const getMaxScore = () => {
    const isCAT = selectedExam?.name?.toLowerCase().includes('cat')
    const isForm1or2 = selectedSubject?.form_level?.includes('Form 1') || selectedSubject?.form_level?.includes('Form 2')
    return isCAT && isForm1or2 ? 50 : 100
  }

  return (
    <div className="p-6">
      <div className="mb-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">🎯 Grades Portal</h1>
        <div className="space-x-2">
          <button
            onClick={() => setViewMode('entry')}
            className={`px-3 py-1 rounded ${viewMode === 'entry' ? 'bg-blue-600 text-white' : 'bg-gray-300'}`}
          >
            ➕ Enter Grades
          </button>
          <button
            onClick={() => {
              setViewMode('view')
              handleViewGrades()
            }}
            className={`px-3 py-1 rounded ${viewMode === 'view' ? 'bg-blue-600 text-white' : 'bg-gray-300'}`}
          >
            📄 View Grades
          </button>
        </div>
      </div>

      {/* Subject Dropdown */}
      <div className="mb-4">
        <label className="block font-medium mb-1">Select Subject</label>
        <select
          value={selectedSubjectId ?? ''}
          onChange={(e) => setSelectedSubjectId(Number(e.target.value))}
          className="w-full max-w-md border p-2 rounded"
        >
          <option value="">-- Choose Subject --</option>
          {subjects.map((s) => (
            <option key={s.subject_id} value={s.subject_id}>
              {s.class_name} - {s.name} {s.form_level ? `(${s.form_level})` : ''}
            </option>
          ))}
        </select>

        {selectedSubject && (
          <button
            onClick={loadData}
            className="mt-2 px-4 py-1 bg-indigo-600 text-white rounded"
          >
            📥 Load Students & Exams
          </button>
        )}
      </div>

      {/* Exam Picker */}
      {selectedSubject && (
        <div className="mb-4 flex items-center space-x-4">
          <div className="flex-1">
            <label className="block font-medium mb-1">Select Exam</label>
            <select
              value={selectedExamId ?? ''}
              onChange={(e) => setSelectedExamId(Number(e.target.value))}
              className="w-full border p-2 rounded"
            >
              <option value="">-- Choose Exam --</option>
              {exams.map((e) => (
                <option key={e.exam_id} value={e.exam_id}>
                  {e.name} ({e.term} {e.year})
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={handleCreateExam}
            className="mt-6 bg-green-600 text-white px-4 py-2 rounded"
          >
            ➕ New Exam
          </button>
        </div>
      )}

      {/* Grade Entry Mode */}
      {viewMode === 'entry' && students.length > 0 && (
        <>
          <table className="w-full bg-white table-auto shadow rounded">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 text-left">#</th>
                <th className="p-2 text-left">Student</th>
                <th className="p-2 text-left">Score (Max: {getMaxScore()})</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s, i) => (
                <tr key={s.student_id} className="border-t">
                  <td className="p-2">{i + 1}</td>
                  <td className="p-2">{s.first_name} {s.last_name}</td>
                  <td className="p-2">
                    <input
                      type="number"
                      min={0}
                      max={getMaxScore()}
                      className="border p-1 rounded w-24"
                      value={grades[s.student_id]}
                      onChange={(e) => setGrades(prev => ({
                        ...prev,
                        [s.student_id]: parseFloat(e.target.value) || ''
                      }))}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <button
            onClick={handleSubmitGrades}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded"
          >
            💾 Submit Grades
          </button>
        </>
      )}

      {/* View Mode */}
      {viewMode === 'view' && (
        <>
          {existingGrades.length > 0 ? (
            <table className="w-full table-auto bg-white shadow mt-4 rounded">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-2 text-left">Student</th>
                  <th className="p-2 text-left">Score</th>
                </tr>
              </thead>
              <tbody>
                {existingGrades.map((g, i) => (
                  <tr key={i} className="border-t">
                    <td className="p-2">{g.student_name}</td>
                    <td className="p-2">{g.score}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-gray-600 mt-4">No grades found for this selection.</p>
          )}
        </>
      )}
    </div>
  )
}
