import { useEffect, useState } from 'react'
import axios from 'axios'

interface Subject {
  subject_id: number
  name: string
  group: string
  compulsory: boolean
}

export default function AdminSubjects() {
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [loading, setLoading] = useState(true)
  const [name, setName] = useState('')
  const [group, setGroup] = useState('')
  const [compulsory, setCompulsory] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)

  const fetchSubjects = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const res = await axios.get('http://localhost:5001/api/v1/subjects', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setSubjects(res.data)
    } catch (err) {
      console.error('Error fetching subjects:', err)
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setName('')
    setGroup('')
    setCompulsory(false)
    setEditingId(null)
  }

  const handleSubmit = async () => {
    const token = localStorage.getItem('token')
    const payload = { name, group, compulsory }

    try {
      if (editingId) {
        await axios.put(`http://localhost:5001/api/v1/subjects/${editingId}`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        })
      } else {
        await axios.post('http://localhost:5001/api/v1/subjects', payload, {
          headers: { Authorization: `Bearer ${token}` }
        })
      }

      resetForm()
      fetchSubjects()
    } catch (err) {
      console.error('Error saving subject:', err)
    }
  }

  const handleEdit = (subj: Subject) => {
    setEditingId(subj.subject_id)
    setName(subj.name)
    setGroup(subj.group)
    setCompulsory(subj.compulsory)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this subject?')) return
    try {
      const token = localStorage.getItem('token')
      await axios.delete(`http://localhost:5001/api/v1/subjects/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      fetchSubjects()
    } catch (err) {
      console.error('Error deleting subject:', err)
    }
  }

  useEffect(() => {
    fetchSubjects()
  }, [])

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">📘 Manage Subjects</h1>

      {/* Form */}
      <div className="bg-white shadow p-4 rounded mb-6">
        <h2 className="text-lg font-semibold mb-2">{editingId ? '✏️ Edit Subject' : '➕ Add Subject'}</h2>
        <div className="mb-2">
          <label className="block mb-1">Name</label>
          <input
            className="border p-2 w-full rounded"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="mb-2">
          <label className="block mb-1">Group</label>
          <input
            className="border p-2 w-full rounded"
            value={group}
            onChange={(e) => setGroup(e.target.value)}
          />
        </div>
        <div className="mb-2 flex items-center space-x-2">
          <input
            type="checkbox"
            checked={compulsory}
            onChange={(e) => setCompulsory(e.target.checked)}
          />
          <label>Is Compulsory?</label>
        </div>
        <button onClick={handleSubmit} className="px-4 py-2 bg-blue-600 text-white rounded">
          {editingId ? '💾 Update' : '➕ Add'}
        </button>
      </div>

      {/* Table */}
      {loading ? (
        <p>Loading...</p>
      ) : (
        <table className="w-full bg-white shadow rounded table-auto">
          <thead className="bg-gray-100">
            <tr>
              <th className="text-left p-2">Name</th>
              <th className="text-left p-2">Group</th>
              <th className="text-left p-2">Compulsory</th>
              <th className="text-left p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {subjects.map((s) => (
              <tr key={s.subject_id} className="border-t">
                <td className="p-2">{s.name}</td>
                <td className="p-2">{s.group}</td>
                <td className="p-2">{s.compulsory ? '✅' : '❌'}</td>
                <td className="p-2 space-x-2">
                  <button
                    className="text-blue-600 hover:underline"
                    onClick={() => handleEdit(s)}
                  >
                    Edit
                  </button>
                  <button
                    className="text-red-600 hover:underline"
                    onClick={() => handleDelete(s.subject_id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {subjects.length === 0 && (
              <tr>
                <td colSpan={4} className="text-center p-4 text-gray-500">
                  No subjects found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  )
}
