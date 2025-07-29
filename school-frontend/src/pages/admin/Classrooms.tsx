import { useEffect, useState } from 'react'
import axios from 'axios'

interface Classroom {
  class_id: number
  class_name: string
  class_teacher_id: number | null
  class_teacher_name?: string
  form_level: string
}

interface Teacher {
  teacher_id: number
  name: string
}

const formLevels = ['Form 1', 'Form 2', 'Form 3', 'Form 4']

export default function AdminClassrooms() {
  const [classrooms, setClassrooms] = useState<Classroom[]>([])
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [formData, setFormData] = useState({
    class_name: '',
    class_teacher_id: null as number | null,
    form_level: '',
  })
  const [editingId, setEditingId] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  const token = localStorage.getItem('token')

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const [clsRes, teacherRes] = await Promise.all([
          axios.get('http://localhost:5001/api/v1/classrooms', {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get('http://localhost:5001/api/v1/teachers', {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ])
        setClassrooms(clsRes.data)
        setTeachers(teacherRes.data)
      } catch (error) {
        console.error('Failed to fetch data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [token])

  const resetForm = () => {
    setFormData({ class_name: '', class_teacher_id: null, form_level: '' })
    setEditingId(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const { class_name, form_level, class_teacher_id } = formData

    if (!class_name.trim() || !form_level.trim()) {
      alert('Class name and form level are required.')
      return
    }

    const payload = {
      class_name: class_name.trim(),
      form_level: form_level.trim(),
      class_teacher_id,
    }

    try {
      if (editingId) {
        await axios.put(`http://localhost:5001/api/v1/classrooms/${editingId}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        })
      } else {
        await axios.post('http://localhost:5001/api/v1/classrooms', payload, {
          headers: { Authorization: `Bearer ${token}` },
        })
      }
      resetForm()
      const refreshed = await axios.get('http://localhost:5001/api/v1/classrooms', {
        headers: { Authorization: `Bearer ${token}` },
      })
      setClassrooms(refreshed.data)
    } catch (err) {
      console.error('Save failed:', err)
      alert('Failed to save classroom.')
    }
  }

  const handleEdit = (cls: Classroom) => {
    setFormData({
      class_name: cls.class_name,
      class_teacher_id: cls.class_teacher_id ?? null,
      form_level: cls.form_level,
    })
    setEditingId(cls.class_id)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this classroom?')) return
    try {
      await axios.delete(`http://localhost:5001/api/v1/classrooms/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setClassrooms((prev) => prev.filter((c) => c.class_id !== id))
    } catch (err) {
      console.error('Delete failed:', err)
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">🏫 Classroom Management</h1>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md mb-8 max-w-md">
        <h2 className="text-xl font-semibold mb-4">{editingId ? '✏️ Edit Classroom' : '➕ Add New Classroom'}</h2>

        <div className="mb-4">
          <label className="block mb-1 font-medium">Class Name</label>
          <input
            type="text"
            value={formData.class_name}
            onChange={(e) => setFormData({ ...formData, class_name: e.target.value })}
            className="border border-gray-300 rounded w-full px-3 py-2"
            placeholder="e.g., Grade 10 - A"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block mb-1 font-medium">Form Level</label>
          <select
            value={formData.form_level}
            onChange={(e) => setFormData({ ...formData, form_level: e.target.value })}
            className="border border-gray-300 rounded w-full px-3 py-2"
            required
          >
            <option value="">-- Select Form Level --</option>
            {formLevels.map((level) => (
              <option key={level} value={level}>
                {level}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label className="block mb-1 font-medium">Class Teacher</label>
          <select
            value={formData.class_teacher_id ?? ''}
            onChange={(e) =>
              setFormData({ ...formData, class_teacher_id: e.target.value ? parseInt(e.target.value) : null })
            }
            className="border border-gray-300 rounded w-full px-3 py-2"
          >
            <option value="">-- Select Teacher (Optional) --</option>
            {teachers.map((t) => (
              <option key={t.teacher_id} value={t.teacher_id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex space-x-2">
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            💾 Save
          </button>
          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      {/* Table */}
      {loading ? (
        <p>Loading classrooms...</p>
      ) : (
        <table className="w-full bg-white rounded shadow overflow-hidden">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="p-3">Class Name</th>
              <th className="p-3">Class Teacher</th>
              <th className="p-3">Form Level</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {classrooms.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-4 text-center text-gray-500">
                  No classrooms available.
                </td>
              </tr>
            ) : (
              classrooms.map((cls) => (
                <tr key={cls.class_id} className="border-t hover:bg-gray-50">
                  <td className="p-3">{cls.class_name}</td>
                  <td className="p-3">{cls.class_teacher_name || '—'}</td>
                  <td className="p-3">{cls.form_level || '—'}</td>
                  <td className="p-3 space-x-3">
                    <button className="text-blue-600 hover:underline" onClick={() => handleEdit(cls)}>
                      Edit
                    </button>
                    <button className="text-red-600 hover:underline" onClick={() => handleDelete(cls.class_id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}
    </div>
  )
}
