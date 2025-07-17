/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/teacher/TeacherGrades.tsx

import { useEffect, useState } from 'react'
import axios from 'axios'

interface Subject {
  subject_id: number
  name: string
  class_id: number
  class_name: string
}

interface StudentGradeSummary {
  student_id: number
  student_name: string
  average_score: number
  kcse_grade: string
}

const API = 'http://localhost:5001/api/v1'
const token = localStorage.getItem('token')
const headers = { Authorization: `Bearer ${token}` }

const getKcseGrade = (score: number) => {
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
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null)
  const [gradeSummaries, setGradeSummaries] = useState<StudentGradeSummary[]>([])

  const fetchSubjects = async () => {
    try {
      const { data } = await axios.get(`${API}/teacher-subjects/me`, { headers })
      setSubjects(data)
    } catch (err) {
      console.error('Failed to load subjects', err)
    }
  }

  const fetchGradesSummary = async (classId: number, subjectId: number) => {
    try {
      const res = await axios.get(`${API}/grades/class/${classId}/subject/${subjectId}`, { headers })
      const raw = res.data

      const summaries = raw.map((s: any) => ({
        student_id: s.student_id,
        student_name: s.student_name,
        average_score: s.average_score,
        kcse_grade: getKcseGrade(s.average_score),
      }))

      setGradeSummaries(summaries)
    } catch (err) {
      console.error('Failed to load grades summary', err)
      setGradeSummaries([])
    }
  }

  useEffect(() => {
    fetchSubjects()
  }, [])

  const handleLoad = () => {
    if (selectedSubject) {
      fetchGradesSummary(selectedSubject.class_id, selectedSubject.subject_id)
    }
  }

  const meanScore = gradeSummaries.length
    ? (
        gradeSummaries.reduce((acc, g) => acc + g.average_score, 0) /
        gradeSummaries.length
      ).toFixed(2)
    : null

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">📊 Subject Grades Summary</h1>

      <div className="mb-4">
        <label className="block font-medium mb-1">Select Subject</label>
        <select
          value={selectedSubject?.subject_id ?? ''}
          onChange={(e) =>
            setSelectedSubject(
              subjects.find((s) => s.subject_id === Number(e.target.value)) || null
            )
          }
          className="w-full max-w-md border p-2 rounded"
        >
          <option value="">-- Choose Subject --</option>
          {subjects.map((s) => (
            <option key={s.subject_id} value={s.subject_id}>
              {s.class_name} - {s.name}
            </option>
          ))}
        </select>

        {selectedSubject && (
          <button
            onClick={handleLoad}
            className="mt-2 px-4 py-1 bg-blue-600 text-white rounded"
          >
            📥 Load Summary
          </button>
        )}
      </div>

      {gradeSummaries.length > 0 && (
        <>
          <table className="w-full table-auto bg-white shadow rounded">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 text-left">#</th>
                <th className="p-2 text-left">Student</th>
                <th className="p-2 text-left">Average Score</th>
                <th className="p-2 text-left">KCSE Grade</th>
              </tr>
            </thead>
            <tbody>
              {gradeSummaries.map((s, i) => (
                <tr key={s.student_id} className="border-t">
                  <td className="p-2">{i + 1}</td>
                  <td className="p-2">{s.student_name}</td>
                  <td className="p-2">{s.average_score.toFixed(2)}</td>
                  <td className="p-2">{s.kcse_grade}</td>
                </tr>
              ))}
              <tr className="bg-gray-100 font-bold">
                <td colSpan={2} className="p-2 text-right">Class Mean:</td>
                <td className="p-2">{meanScore}</td>
                <td className="p-2">{getKcseGrade(Number(meanScore))}</td>
              </tr>
            </tbody>
          </table>
        </>
      )}
    </div>
  )
}
