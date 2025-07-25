/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react'
import axios from 'axios'

const API = 'http://localhost:5001/api/v1'

interface Exam {
  exam_id: number
  name: string
  term: string
  year: number
}

interface ClassAssignment {
  id: number
  class_id: number
  class_name: string
  subject_id: number
  subject_name: string
}

interface Student {
  student_id: number
  first_name: string
  last_name: string
}

interface Schedule {
  id: number
  exam: Exam
  class_assignment: {
    id: number
    classroom: { class_name: string }
    subject: { name: string }
    students: Student[]
  }
}

export default function ExamSchedulesPage() {
  const [exams, setExams] = useState<Exam[]>([])
  const [assignments, setAssignments] = useState<ClassAssignment[]>([])
  const [schedules, setSchedules] = useState<Schedule[]>([])

  const [selectedExamId, setSelectedExamId] = useState<number | null>(null)
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<number | null>(null)

  const [editingId, setEditingId] = useState<number | null>(null)
  const [editExamId, setEditExamId] = useState<number | null>(null)
  const [editAssignmentId, setEditAssignmentId] = useState<number | null>(null)

  const [openGradesId, setOpenGradesId] = useState<number | null>(null)
  const [gradeInputs, setGradeInputs] = useState<{ student_id: number; full_name: string; marks: string }[]>([])

  const token = localStorage.getItem('token')
  const headers = { Authorization: `Bearer ${token}` }

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    await Promise.all([fetchExams(), fetchAssignments(), fetchSchedules()])
  }

  const fetchExams = async () => {
    try {
      const res = await axios.get(`${API}/exams`, { headers })
      setExams(res.data)
    } catch {
      alert('❌ Failed to fetch exams')
    }
  }

  const fetchAssignments = async () => {
    try {
      const res = await axios.get(`${API}/assignments/me`, { headers })
      setAssignments(res.data)
    } catch {
      alert('❌ Failed to fetch your class assignments')
    }
  }

  const fetchSchedules = async () => {
    try {
      const res = await axios.get(`${API}/exam-schedules`, { headers })
      setSchedules(res.data)
    } catch {
      alert('❌ Failed to fetch schedules')
    }
  }

  const handleCreateSchedule = async () => {
    if (!selectedExamId || !selectedAssignmentId) {
      return alert('❌ Please select both an exam and a class assignment.')
    }

    try {
      await axios.post(`${API}/exam-schedules`, {
        exam_id: selectedExamId,
        class_assignment_id: selectedAssignmentId,
      }, { headers })

      alert('✅ Schedule created successfully')
      setSelectedExamId(null)
      setSelectedAssignmentId(null)
      fetchSchedules()
    } catch (err: any) {
      if (err.response?.status === 409) {
        alert('⚠️ This schedule already exists.')
      } else {
        alert('❌ Failed to create schedule')
      }
    }
  }

  const handleEdit = (s: Schedule) => {
    setEditingId(s.id)
    setEditExamId(s.exam.exam_id)
    setEditAssignmentId(s.class_assignment?.id ?? null)
    setOpenGradesId(null)
  }

  const handleSubmitEdit = async () => {
    if (!editingId || !editExamId || !editAssignmentId) {
      return alert('❌ Please fill in all fields before saving.')
    }

    try {
      await axios.put(`${API}/exam-schedules/${editingId}`, {
        exam_id: editExamId,
        class_assignment_id: editAssignmentId,
      }, { headers })

      alert('✅ Schedule updated successfully')
      setEditingId(null)
      fetchSchedules()
    } catch {
      alert('❌ Failed to update schedule')
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this schedule?')) return

    try {
      await axios.delete(`${API}/exam-schedules/${id}`, { headers })
      alert('🗑️ Schedule deleted successfully')
      fetchSchedules()
    } catch {
      alert('❌ Failed to delete schedule')
    }
  }

  const handleSubmitGrades = async (examScheduleId: number) => {
    const entries = gradeInputs
      .filter((g) => g.marks !== '')
      .map((g) => ({
        student_id: g.student_id,
        marks: Number(g.marks),
      }))

    if (entries.length === 0) return alert('❌ Please enter at least one mark.')

    try {
      await axios.post(`${API}/grades/`, {
        exam_schedule_id: examScheduleId,
        grades: entries,
      }, { headers })

      alert('✅ Grades saved successfully!')
      setOpenGradesId(null)
    } catch {
      alert('❌ Failed to save grades.')
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <h1 className="text-3xl font-bold text-blue-800 mb-6">🗓 Exam Schedules & Grades</h1>

      {/* Create Schedule */}
      <div className="bg-white p-5 rounded shadow mb-8">
        <h2 className="text-xl font-semibold mb-4">➕ Create New Exam Schedule</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block font-medium mb-1">Exam</label>
            <select
              className="w-full border px-3 py-2 rounded"
              value={selectedExamId ?? ''}
              onChange={(e) => setSelectedExamId(e.target.value ? Number(e.target.value) : null)}
            >
              <option value="">-- Select Exam --</option>
              {exams.map((exam) => (
                <option key={exam.exam_id} value={exam.exam_id}>
                  {exam.name} ({exam.term} {exam.year})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-medium mb-1">Class Assignment</label>
            <select
              className="w-full border px-3 py-2 rounded"
              value={selectedAssignmentId ?? ''}
              onChange={(e) => setSelectedAssignmentId(e.target.value ? Number(e.target.value) : null)}
            >
              <option value="">-- Select Class + Subject --</option>
              {assignments.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.class_name} - {a.subject_name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          onClick={handleCreateSchedule}
          className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
          disabled={!selectedExamId || !selectedAssignmentId}
        >
          ➕ Create Schedule
        </button>
      </div>

      {/* Schedule List */}
      <div className="bg-white p-5 rounded shadow">
        <h2 className="text-xl font-semibold mb-4">📋 All Exam Schedules</h2>

        {schedules.length === 0 ? (
          <p className="text-gray-500">No schedules created yet.</p>
        ) : (
          schedules.map((s) => (
            <div key={s.id} className="border-b py-4">
              <div className="flex justify-between items-center">
                <div>
                  <strong>{s.exam.name}</strong> – {s.class_assignment.classroom.class_name} (
                  {s.class_assignment.subject.name})
                </div>
                <div className="space-x-2">
                  <button
                    onClick={() => {
                      setEditingId(null)
                      setOpenGradesId((prev) => (prev === s.id ? null : s.id))
                      setGradeInputs(
                        s.class_assignment.students.map((stu) => ({
                          student_id: stu.student_id,
                          full_name: `${stu.first_name} ${stu.last_name}`,
                          marks: ''
                        }))
                      )
                    }}
                    className="text-purple-600 hover:underline"
                  >
                    🎯 Enter Grades
                  </button>
                  <button
                    onClick={() => handleEdit(s)}
                    className="text-blue-600 hover:underline"
                  >
                    ✏️ Edit
                  </button>
                  <button
                    onClick={() => handleDelete(s.id)}
                    className="text-red-600 hover:underline"
                  >
                    🗑 Delete
                  </button>
                </div>
              </div>

              {/* Edit Section */}
              {editingId === s.id && (
                <div className="mt-3 p-3 bg-gray-100 rounded space-y-2">
                  <div>
                    <label className="block text-sm mb-1">Exam</label>
                    <select
                      className="w-full border px-3 py-1 rounded"
                      value={editExamId ?? ''}
                      onChange={(e) => setEditExamId(Number(e.target.value))}
                    >
                      <option value="">-- Select Exam --</option>
                      {exams.map((exam) => (
                        <option key={exam.exam_id} value={exam.exam_id}>
                          {exam.name} ({exam.term} {exam.year})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm mb-1">Assignment</label>
                    <select
                      className="w-full border px-3 py-1 rounded"
                      value={editAssignmentId ?? ''}
                      onChange={(e) => setEditAssignmentId(Number(e.target.value))}
                    >
                      <option value="">-- Select Assignment --</option>
                      {assignments.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.class_name} - {a.subject_name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-x-2">
                    <button
                      onClick={handleSubmitEdit}
                      className="bg-green-600 text-white px-3 py-1 rounded"
                    >
                      ✅ Save
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="bg-gray-300 px-3 py-1 rounded"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Grade Entry Section */}
              {openGradesId === s.id && (
                <div className="mt-3 bg-gray-50 p-4 rounded">
                  <h3 className="font-semibold mb-3">📝 Enter Grades</h3>
                  {gradeInputs.length === 0 ? (
                    <p className="text-gray-500">No students found for this class.</p>
                  ) : (
                    <div className="space-y-2">
                      {gradeInputs.map((g, idx) => (
                        <div key={g.student_id} className="flex items-center space-x-4">
                          <div className="w-1/2">{g.full_name}</div>
                          <input
                            type="number"
                            className="w-24 border px-2 py-1 rounded"
                            placeholder="Marks"
                            value={g.marks}
                            onChange={(e) => {
                              const updated = [...gradeInputs]
                              updated[idx].marks = e.target.value
                              setGradeInputs(updated)
                            }}
                          />
                        </div>
                      ))}
                      <button
                        onClick={() => handleSubmitGrades(s.id)}
                        className="mt-3 bg-blue-600 text-white px-3 py-2 rounded"
                      >
                        💾 Submit Grades
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
