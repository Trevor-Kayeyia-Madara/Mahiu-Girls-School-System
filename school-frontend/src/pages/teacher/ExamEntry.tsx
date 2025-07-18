
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

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">📚 Exam Schedules</h1>

      {/* Create Schedule Form */}
      <div className="bg-white p-4 rounded shadow mb-6">
        <h2 className="font-semibold text-lg mb-3">➕ Create New Schedule</h2>

        <div className="mb-3">
          <label className="block mb-1 font-medium">Select Exam</label>
          <select
            className="w-full border rounded p-2"
            value={selectedExamId ?? ''}
            onChange={(e) => setSelectedExamId(e.target.value ? Number(e.target.value) : null)}
          >
            <option value="">-- Choose Exam --</option>
            {exams.map((exam) => (
              <option key={exam.exam_id} value={exam.exam_id}>
                {exam.name} ({exam.term} {exam.year})
              </option>
            ))}
          </select>
        </div>

        <div className="mb-3">
          <label className="block mb-1 font-medium">Select Class Assignment</label>
          <select
  className="w-full border rounded p-2"
  value={selectedAssignmentId ?? ''}
  onChange={(e) => {
    const value = e.target.value
    setSelectedAssignmentId(value ? parseInt(value) : null)
  }}
>
  <option value="">-- Choose Assignment --</option>
  {assignments.map((a) => (
    <option key={a.id} value={a.id}>
      {a.class_name} - {a.subject_name}
    </option>
  ))}
</select>

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
      <div className="bg-white p-4 rounded shadow">
        <h2 className="text-lg font-semibold mb-4">📋 All Schedules</h2>

        {schedules.length === 0 ? (
          <p className="text-gray-500">No schedules created yet.</p>
        ) : (
          schedules.map((s) => (
            <div key={s.id} className="border-b py-3">
              <div className="flex justify-between items-center">
                <div>
                  <strong>{s.exam.name}</strong> — {s.class_assignment.classroom.class_name} (
                  {s.class_assignment.subject.name})
                </div>
                <div className="space-x-2">
                  <button
                    onClick={() => handleEdit(s)}
                    className="text-blue-600 hover:underline"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(s.id)}
                    className="text-red-600 hover:underline"
                  >
                    Delete
                  </button>
                </div>
              </div>

              {/* Edit Form */}
              {editingId === s.id && (
                <div className="mt-2 bg-gray-50 p-3 rounded">
                  <div className="mb-2">
                    <label className="block text-sm">Edit Exam</label>
                    <select
                      className="w-full border rounded p-2"
                      value={editExamId ?? ''}
                      onChange={(e) => setEditExamId(e.target.value ? Number(e.target.value) : null)}
                    >
                      <option value="">-- Choose Exam --</option>
                      {exams.map((exam) => (
                        <option key={exam.exam_id} value={exam.exam_id}>
                          {exam.name} ({exam.term} {exam.year})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-2">
                    <label className="block text-sm">Edit Assignment</label>
                    <select
                      className="w-full border rounded p-2"
                      value={editAssignmentId ?? ''}
                      onChange={(e) => setEditAssignmentId(e.target.value ? Number(e.target.value) : null)}
                    >
                      <option value="">-- Choose Assignment --</option>
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
                      💾 Save
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
            </div>
          ))
        )}
      </div>
    </div>
  )
}
