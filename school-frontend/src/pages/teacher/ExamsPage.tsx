import { useEffect, useState } from 'react'
import axios from 'axios'

interface Subject {
  subject_id: number
  name: string
  class_id: number
  class_name: string
}

interface Exam {
  exam_id: number
  name: string
  term: string
  year: number
}

const API = 'http://localhost:5001/api/v1'
const token = localStorage.getItem('token')
const headers = { Authorization: `Bearer ${token}` }

export default function ExamsPage() {
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null)
  const [exams, setExams] = useState<Exam[]>([])

  const fetchSubjects = async () => {
    try {
      const { data } = await axios.get(`${API}/teacher-subjects/me`, { headers })
      setSubjects(data)
    } catch (err) {
      console.error('Error fetching subjects', err)
    }
  }

  const fetchExams = async (classId: number, subjectId: number) => {
    try {
      const { data } = await axios.get(`${API}/exams/class/${classId}/subject/${subjectId}`, { headers })
      setExams(data)
    } catch (err) {
      console.error('Error fetching exams', err)
    }
  }

  const handleLoad = () => {
    if (selectedSubject) {
      fetchExams(selectedSubject.class_id, selectedSubject.subject_id)
    }
  }

  const handleCreate = async () => {
    if (!selectedSubject) return

    const name = prompt('Exam name (e.g. CAT 2):')?.trim()
    const term = prompt('Term (e.g. Term 2):')?.trim()
    const year = prompt('Year (e.g. 2025):')?.trim()

    if (!name || !term || !year) return alert('All fields required')

    try {
      await axios.post(`${API}/exams`, {
        name,
        term,
        year,
        subject_id: selectedSubject.subject_id,
        class_id: selectedSubject.class_id,
      }, { headers })

      alert('✅ Exam created')
      fetchExams(selectedSubject.class_id, selectedSubject.subject_id)
    } catch (err) {
      console.error('Create exam failed', err)
      alert('❌ Failed to create')
    }
  }

  const handleDelete = async (examId: number) => {
    if (!window.confirm('Delete this exam?')) return
    try {
      await axios.delete(`${API}/exams/${examId}`, { headers })
      if (selectedSubject)
        fetchExams(selectedSubject.class_id, selectedSubject.subject_id)
    } catch (err) {
      console.error('Delete failed', err)
      alert('❌ Could not delete')
    }
  }

  useEffect(() => {
    fetchSubjects()
  }, [])

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">📝 Manage Exams</h1>

      <div className="mb-4">
        <label className="block font-medium mb-1">Select Subject</label>
        <select
          value={selectedSubject?.subject_id ?? ''}
          onChange={(e) => {
            const selected = subjects.find(s => s.subject_id === Number(e.target.value))
            setSelectedSubject(selected ?? null)
          }}
          className="w-full max-w-md border p-2 rounded"
        >
          <option value="">-- Choose --</option>
          {subjects.map(s => (
            <option key={s.subject_id} value={s.subject_id}>
              {s.class_name} - {s.name}
            </option>
          ))}
        </select>
        {selectedSubject && (
          <button
            onClick={handleLoad}
            className="mt-2 bg-blue-600 text-white px-4 py-1 rounded"
          >
            📥 Load Exams
          </button>
        )}
      </div>

      {selectedSubject && (
        <div className="mb-4">
          <button
            onClick={handleCreate}
            className="bg-green-600 text-white px-4 py-2 rounded"
          >
            ➕ Create Exam
          </button>
        </div>
      )}

      {exams.length > 0 && (
        <table className="w-full table-auto bg-white shadow rounded">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 text-left">#</th>
              <th className="p-2 text-left">Name</th>
              <th className="p-2 text-left">Term</th>
              <th className="p-2 text-left">Year</th>
              <th className="p-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {exams.map((e, i) => (
              <tr key={e.exam_id} className="border-t">
                <td className="p-2">{i + 1}</td>
                <td className="p-2">{e.name}</td>
                <td className="p-2">{e.term}</td>
                <td className="p-2">{e.year}</td>
                <td className="p-2">
                  <button
                    onClick={() => handleDelete(e.exam_id)}
                    className="text-red-600 underline text-sm"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
