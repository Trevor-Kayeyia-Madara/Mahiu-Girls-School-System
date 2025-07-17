import { useState } from 'react'
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

export default function ExamsPage() {
  const [exams, setExams] = useState<Exam[]>([])
  const [loading, setLoading] = useState(false)

  const fetchExams = async () => {
    setLoading(true)
    try {
      const { data } = await axios.get(`${API}/exams/`)
      setExams(data)
    } catch (err) {
      console.error('Error fetching exams', err)
      alert('❌ Could not fetch exams.')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async () => {
    const token = localStorage.getItem('token')
    if (!token) return alert('❌ Not logged in')

    const name = prompt('Exam name (e.g. Midterm)')?.trim()
    const term = prompt('Term (e.g. Term 2)')?.trim()
    const year = prompt('Year (e.g. 2025)')?.trim()

    if (!name || !term || !year) {
      alert('❌ All fields are required.')
      return
    }

    try {
      await axios.post(`${API}/exams/`, {
        name,
        term,
        year: parseInt(year),
      }, {
        headers: { Authorization: `Bearer ${token}` }
      })

      alert('✅ Exam created')
      fetchExams()
    } catch (err) {
      console.error('Create exam failed', err)
      alert('❌ Failed to create exam.')
    }
  }

  const handleDelete = async (examId: number) => {
    const token = localStorage.getItem('token')
    if (!token) return alert('❌ Not logged in')

    if (!window.confirm('Delete this exam?')) return

    try {
      await axios.delete(`${API}/exams/${examId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      fetchExams()
    } catch (err) {
      console.error('Delete failed', err)
      alert('❌ Could not delete exam.')
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto text-gray-800">
      <h1 className="text-2xl font-bold mb-6">📝 Exam Management</h1>

      <div className="flex gap-4 mb-6">
        <button
          onClick={fetchExams}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow"
        >
          📥 Load Exams
        </button>
        <button
          onClick={handleCreate}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded shadow"
        >
          ➕ Create Exam
        </button>
      </div>

      {loading && <p className="text-gray-600">Loading exams...</p>}

      {exams.length > 0 ? (
        <table className="w-full table-auto bg-white shadow rounded overflow-hidden">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="p-3">#</th>
              <th className="p-3">Name</th>
              <th className="p-3">Term</th>
              <th className="p-3">Year</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {exams.map((e, i) => (
              <tr key={e.exam_id} className="border-t hover:bg-gray-50">
                <td className="p-3">{i + 1}</td>
                <td className="p-3">{e.name}</td>
                <td className="p-3">{e.term}</td>
                <td className="p-3">{e.year}</td>
                <td className="p-3">
                  <button
                    onClick={() => handleDelete(e.exam_id)}
                    className="text-red-600 hover:underline text-sm"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : !loading && (
        <p className="text-gray-600">No exams found.</p>
      )}
    </div>
  )
}
