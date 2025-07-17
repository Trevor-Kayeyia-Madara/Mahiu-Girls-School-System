import {  useState } from 'react'
import axios from 'axios'

interface Exam {
  exam_id: number
  name: string
  term: string
  year: number
  class_id: number
  subject_id: number
}

const API = 'http://localhost:5001/api/v1'
const token = localStorage.getItem('token')
const headers = { Authorization: `Bearer ${token}` }

export default function ExamsPage() {
  const [exams, setExams] = useState<Exam[]>([])
  const [loading, setLoading] = useState(false)

  const [classId, setClassId] = useState('')
  const [subjectId, setSubjectId] = useState('')

  const fetchExams = async () => {
    if (!classId || !subjectId) return alert('Class ID and Subject ID are required.')

    setLoading(true)
    try {
      const { data } = await axios.get(
        `${API}/exams/class/${classId}/subject/${subjectId}`,
        { headers }
      )
      setExams(data)
    } catch (err) {
      console.error('Error fetching exams', err)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async () => {
    const name = prompt('Exam name (e.g. Midterm)')?.trim()
    const term = prompt('Term (e.g. Term 2)')?.trim()
    const year = prompt('Year (e.g. 2025)')?.trim()

    if (!name || !term || !year || !classId || !subjectId) {
      return alert('All fields are required (including class and subject).')
    }

    try {
      await axios.post(
        `${API}/exams`,
        {
          name,
          term,
          year,
          subject_id: Number(subjectId),
          class_id: Number(classId),
        },
        { headers }
      )

      alert('✅ Exam created')
      fetchExams()
    } catch (err) {
      console.error('Create exam failed', err)
      alert('❌ Failed to create exam.')
    }
  }

  const handleDelete = async (examId: number) => {
    if (!window.confirm('Delete this exam?')) return
    try {
      await axios.delete(`${API}/exams/${examId}`, { headers })
      fetchExams()
    } catch (err) {
      console.error('Delete failed', err)
      alert('❌ Could not delete exam.')
    }
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-xl font-bold mb-4">📝 Exam Management</h1>

      <div className="mb-4 grid grid-cols-2 gap-4">
        <input
          type="number"
          placeholder="Class ID"
          value={classId}
          onChange={(e) => setClassId(e.target.value)}
          className="border p-2 rounded"
        />
        <input
          type="number"
          placeholder="Subject ID"
          value={subjectId}
          onChange={(e) => setSubjectId(e.target.value)}
          className="border p-2 rounded"
        />
        <button
          onClick={fetchExams}
          className="bg-blue-600 text-white px-4 py-2 rounded col-span-2"
        >
          📥 Load Exams
        </button>
      </div>

      <div className="mb-4">
        <button
          onClick={handleCreate}
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          ➕ Create Exam
        </button>
      </div>

      {loading && <p>Loading exams...</p>}

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
