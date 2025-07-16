/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState, useCallback } from 'react'
import axios from 'axios'

interface Subject {
  subject_id: number
  name: string
  class_id: number
  class_name: string
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

// KCSE grade converter
const getKCSEGrade = (score: number): string => {
  if (score >= 80) return 'A'
  if (score >= 75) return 'A-'
  if (score >= 70) return 'B+'
  if (score >= 65) return 'B'
  if (score >= 60) return 'B-'
  if (score >= 55) return 'C+'
  if (score >= 50) return 'C'
  if (score >= 45) return 'C-'
  if (score >= 40) return 'D+'
  if (score >= 35) return 'D'
  if (score >= 30) return 'D-'
  return 'E'
}

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

  useEffect(() => {
    axios.get(`${API}/teacher-subjects/me`, { headers })
      .then(res => setSubjects(Array.isArray(res.data) ? res.data : []))
      .catch(() => setSubjects([]))
  }, [])

  const fetchStudents = useCallback(async (classId: number) => {
    const { data } = await axios.get(`${API}/students/class/${classId}`, { headers })
    setStudents(data)
    const initial: { [id: number]: number | '' } = {}
    data.forEach((s: Student) => (initial[s.student_id] = ''))
    setGrades(initial)
  }, [])

  const fetchExams = useCallback(async (classId: number, subjectId: number) => {
    const { data } = await axios.get(`${API}/exams/class/${classId}/subject/${subjectId}`, { headers })
    setExams(data)
    setSelectedExamId(data[0]?.exam_id ?? null)
  }, [])

  const loadData = async () => {
    if (!selectedSubject) return
    await fetchStudents(selectedSubject.class_id)
    await fetchExams(selectedSubject.class_id, selectedSubject.subject_id)
  }

  const handleSubmitGrades = async () => {
    if (!selectedExamId || !selectedSubject) return alert('Select subject and exam first.')
    const payload = Object.entries(grades).filter(([, v]) => v !== '').map(([id, score]) => ({
      student_id: parseInt(id),
      score,
      class_id: selectedSubject.class_id,
      subject_id: selectedSubject.subject_id,
      exam_id: selectedExamId
    }))

    try {
      await axios.post(`${API}/grades/bulk`, payload, { headers })
      alert('✅ Grades submitted successfully')
    } catch {
      alert('❌ Failed to submit grades')
    }
  }

  const handleCreateExam = async () => {
    if (!selectedSubject) return
    const name = prompt('Exam name (e.g. CAT 2):')?.trim()
    const term = prompt('Term (e.g. Term 2):')?.trim()
    const year = prompt('Year (e.g. 2025):')?.trim()
    if (!name || !term || !year) return alert('All fields are required.')

    await axios.post(`${API}/exams`, {
      name, term, year,
      subject_id: selectedSubject.subject_id,
      class_id: selectedSubject.class_id
    }, { headers })

    fetchExams(selectedSubject.class_id, selectedSubject.subject_id)
  }

  const handleViewGrades = async () => {
    if (!selectedExamId || !selectedSubject) return
    const { data } = await axios.get(
      `${API}/grades/class/${selectedSubject.class_id}/subject/${selectedSubject.subject_id}/exam/${selectedExamId}`,
      { headers }
    )
    setExistingGrades(data)
  }

  const calculateMean = (scores: number[]): number => {
    const valid = scores.filter((s) => !isNaN(s))
    if (!valid.length) return 0
    return parseFloat((valid.reduce((a, b) => a + b, 0) / valid.length).toFixed(2))
  }

  return (
    <div className="p-6">
      <div className="flex justify-between mb-4">
        <h1 className="text-xl font-bold">🎯 Grades Portal</h1>
        <div className="space-x-2">
          <button onClick={() => setViewMode('entry')} className={`px-3 py-1 rounded ${viewMode === 'entry' ? 'bg-blue-600 text-white' : 'bg-gray-300'}`}>➕ Enter Grades</button>
          <button onClick={() => { setViewMode('view'); handleViewGrades(); }} className={`px-3 py-1 rounded ${viewMode === 'view' ? 'bg-blue-600 text-white' : 'bg-gray-300'}`}>📄 View Grades</button>
        </div>
      </div>

      {/* Subject Selector */}
      <div className="mb-4">
        <label className="block font-medium mb-1">Subject</label>
        <select value={selectedSubjectId ?? ''} onChange={(e) => setSelectedSubjectId(Number(e.target.value))} className="border p-2 rounded w-full max-w-md">
          <option value="">-- Choose Subject --</option>
          {subjects.map(s => (
            <option key={s.subject_id} value={s.subject_id}>{s.class_name} - {s.name}</option>
          ))}
        </select>
        {selectedSubject && (
          <button onClick={loadData} className="mt-2 bg-indigo-600 text-white px-4 py-1 rounded">📥 Load Students & Exams</button>
        )}
      </div>

      {/* Exam Picker */}
      {selectedSubject && (
        <div className="mb-4 flex items-center gap-4">
          <div className="flex-1">
            <label className="block font-medium">Exam</label>
            <select value={selectedExamId ?? ''} onChange={(e) => setSelectedExamId(Number(e.target.value))} className="w-full border p-2 rounded">
              <option value="">-- Choose Exam --</option>
              {exams.map((e) => (
                <option key={e.exam_id} value={e.exam_id}>{e.name} ({e.term} {e.year})</option>
              ))}
            </select>
          </div>
          <button onClick={handleCreateExam} className="mt-6 bg-green-600 text-white px-4 py-2 rounded">➕ New Exam</button>
        </div>
      )}

      {/* Entry Mode Table */}
      {viewMode === 'entry' && students.length > 0 && (
        <>
          <table className="w-full bg-white shadow table-auto rounded">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 text-left">#</th>
                <th className="p-2 text-left">Student</th>
                <th className="p-2 text-left">Score</th>
                <th className="p-2 text-left">Grade</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s, i) => {
                const score = grades[s.student_id]
                const numericScore = typeof score === 'number' ? score : NaN
                const grade = isNaN(numericScore) ? '-' : getKCSEGrade(numericScore)

                return (
                  <tr key={s.student_id} className="border-t">
                    <td className="p-2">{i + 1}</td>
                    <td className="p-2">{s.first_name} {s.last_name}</td>
                    <td className="p-2">
                      <input
                        type="number"
                        min={0}
                        max={100}
                        className="border p-1 rounded w-24"
                        value={grades[s.student_id]}
                        onChange={(e) => setGrades(prev => ({
                          ...prev,
                          [s.student_id]: parseFloat(e.target.value) || ''
                        }))}
                      />
                    </td>
                    <td className="p-2">{grade}</td>
                  </tr>
                )
              })}
              {/* Summary row */}
              <tr className="font-bold bg-gray-100">
                <td colSpan={2} className="p-2 text-right">Class Mean</td>
                <td className="p-2">
                  {(() => {
                    const validScores = Object.values(grades).filter(v => typeof v === 'number') as number[]
                    const mean = calculateMean(validScores)
                    return mean || '-'
                  })()}
                </td>
                <td className="p-2">
                  {(() => {
                    const validScores = Object.values(grades).filter(v => typeof v === 'number') as number[]
                    const mean = calculateMean(validScores)
                    return mean ? getKCSEGrade(mean) : '-'
                  })()}
                </td>
              </tr>
            </tbody>
          </table>

          <button onClick={handleSubmitGrades} className="mt-4 bg-blue-600 text-white px-4 py-2 rounded">
            💾 Submit Grades
          </button>
        </>
      )}

      {/* View Mode */}
      {viewMode === 'view' && (
        existingGrades.length > 0 ? (
          <table className="w-full mt-4 bg-white shadow table-auto rounded">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 text-left">Student</th>
                <th className="p-2 text-left">Score</th>
                <th className="p-2 text-left">Grade</th>
              </tr>
            </thead>
            <tbody>
              {existingGrades.map((g, i) => (
                <tr key={i} className="border-t">
                  <td className="p-2">{g.student_name}</td>
                  <td className="p-2">{g.score}</td>
                  <td className="p-2">{getKCSEGrade(g.score)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : <p className="mt-4 text-gray-600">No grades found for this exam.</p>
      )}
    </div>
  )
}
