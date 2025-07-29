import { useState, useEffect } from 'react'

interface ClassroomFormProps {
  onSubmit: (data: { class_name: string; class_teacher_id: number | null }) => void
  teachers: { teacher_id: number; name: string }[]
  initialData?: { class_name?: string; class_teacher_id?: number | null }
  isEditing?: boolean
}

export default function ClassroomForm({
  onSubmit,
  teachers,
  initialData = {},
  isEditing = false,
}: ClassroomFormProps) {
  const [form, setForm] = useState<{ class_name?: string; class_teacher_id?: number | null }>(initialData)

  useEffect(() => {
    setForm(initialData)
  }, [initialData])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.class_name || form.class_name.trim() === '') {
      alert('Class name is required.')
      return
    }
    onSubmit({
      class_name: form.class_name,
      class_teacher_id: form.class_teacher_id || null,
    })
    setForm({})
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white p-4 mb-6 rounded shadow">
      <h2 className="text-lg font-semibold mb-3">{isEditing ? 'Edit Classroom' : 'Add Classroom'}</h2>
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
      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
        💾 Save
      </button>
    </form>
  )
}
