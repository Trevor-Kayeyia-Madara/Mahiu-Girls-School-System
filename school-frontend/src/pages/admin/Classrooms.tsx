/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from 'react'
import axios from 'axios'

interface Classroom {
  class_id: number
  class_name: string
  class_teacher_id: number | null
  class_teacher_name?: string
}

interface Teacher {
  teacher_id: number
  name: string
}

export default function AdminClassrooms() {
  const [classrooms, setClassrooms] = useState<Classroom[]>([])
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [form, setForm] = useState<Partial<Classroom>>({})
  const [editingId, setEditingId] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  const token = localStorage.getItem("token")

  const fetchData = async () => {
    setLoading(true)
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
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleSubmit = async () => {
    try {
      const payload = {
        class_name: form.class_name,
        class_teacher_id: form.class_teacher_id || null,
      }

      if (editingId) {
        await axios.put(`http://localhost:5001/api/v1/classrooms/${editingId}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        })
      } else {
        await axios.post('http://localhost:5001/api/v1/classrooms', payload, {
          headers: { Authorization: `Bearer ${token}` },
        })
      }

      setForm({})
      setEditingId(null)
      fetchData()
    } catch (err) {
      console.error('Error saving classroom:', err)
      alert('Failed to save classroom.')
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this classroom?')) return
    try {
      await axios.delete(`http://localhost:5001/api/v1/classrooms/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      fetchData()
    } catch (err) {
      console.error('Error deleting classroom:', err)
    }
  }

  const handleEdit = (cls: Classroom) => {
    setForm({
      class_name: cls.class_name,
      class_teacher_id: cls.class_teacher_id || undefined,
    })
    setEditingId(cls.class_id)
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">🏫 Manage Classrooms</h1>

      <div className="bg-white p-4 mb-6 rounded shadow">
        <h2 className="text-lg font-semibold mb-3">{editingId ? 'Edit Classroom' : 'Add Classroom'}</h2>
        <input
          type="text"
          placeholder="Class Name"
          value={form.class_name || ''}
          onChange={(e) => setForm((f) => ({ ...f, class_name: e.target.value }))}
          className="border p-2 rounded w-full mb-3"
        />
        <select
          value={form.class_teacher_id || ''}
          onChange={(e) =>
            setForm((f) => ({ ...f, class_teacher_id: e.target.value ? parseInt(e.target.value) : null }))
          }
          className="border p-2 rounded w-full mb-3"
        >
          <option value="">-- Select Class Teacher (Optional) --</option>
          {teachers.map((t) => (
            <option key={t.teacher_id} value={t.teacher_id}>
              {t.name}
            </option>
          ))}
        </select>
        <button onClick={handleSubmit} className="bg-blue-600 text-white px-4 py-2 rounded">
          💾 Save
        </button>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <table className="w-full table-auto bg-white shadow rounded">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 text-left">Class Name</th>
              <th className="p-2 text-left">Class Teacher</th>
              <th className="p-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {classrooms.map((cls) => (
              <tr key={cls.class_id} className="border-t">
                <td className="p-2">{cls.class_name}</td>
                <td className="p-2">{cls.class_teacher_name || '—'}</td>
                <td className="p-2 space-x-2">
                  <button className="text-blue-600 hover:underline" onClick={() => handleEdit(cls)}>
                    Edit
                  </button>
                  <button className="text-red-600 hover:underline" onClick={() => handleDelete(cls.class_id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {classrooms.length === 0 && (
              <tr>
                <td colSpan={3} className="p-4 text-center text-gray-500">
                  No classrooms available.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  )
}
