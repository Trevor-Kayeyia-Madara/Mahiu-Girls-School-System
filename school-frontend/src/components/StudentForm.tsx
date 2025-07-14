/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useEffect, useState } from 'react'
import axios from 'axios'

interface Props {
  student: any
  onClose: () => void
  onSaved: () => void
}

interface Classroom {
  class_id: number
  class_name: string
}

interface Parent{
  parent_id: number
  name: string
}

export default function StudentForm({ student, onClose, onSaved }: Props) {
  const [form, setForm] = useState({
    admission_number: '',
    first_name: '',
    last_name: '',
    gender: '',
    date_of_birth: '',
    parent_id: '',
    class_id: '',
  })

  const [classes, setClasses] = useState<Classroom[]>([])
  const [parents, setParents] = useState<Parent[]>([])
  const token = localStorage.getItem('token')

  const fetchClasses = useCallback(async () => {
    const res = await axios.get('http://localhost:5001/api/v1/classrooms', {
      headers: { Authorization: `Bearer ${token}` },
    })
    setClasses(res.data)
  }, [token])

  const fetchParents = useCallback(async () => {
    const res = await axios.get('http://localhost:5001/api/v1/parents', {
      headers: { Authorization: `Bearer ${token}` },
    })
    setParents(res.data)
  }, [token])

  useEffect(() => {
    if (student) {
      setForm({
        ...student,
        class_id: String(student.class_id || ''),
        parent_id: String(student.parent_id || ''),
        date_of_birth: String(student.date_of_birth|| '',)
      })
    }
    fetchClasses()
    fetchParents()
  }, [student, fetchClasses, fetchParents])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async () => {
    try {
      const payload = {
        ...form,
        class_id: parseInt(form.class_id),
        date_of_birth: form.date_of_birth || null,
      }

      if (student) {
        await axios.put(`http://localhost:5001/api/v1/students/${student.student_id}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        })
      } else {
        await axios.post(`http://localhost:5001/api/v1/students`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        })
      }

      onSaved()
      onClose()
    } catch (err) {
      console.error('Error saving student:', err)
      alert('Error saving student.')
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded shadow-md w-full max-w-lg relative">
        <h2 className="text-xl font-semibold mb-4">{student ? 'Edit' : 'Add'} Student</h2>

        <div className="grid grid-cols-2 gap-4">
          <input
            name="admission_number"
            placeholder="Admission #"
            value={form.admission_number}
            onChange={handleChange}
            className="border p-2 rounded"
          />

          <select
            name="class_id"
            value={form.class_id}
            onChange={handleChange}
            className="border p-2 rounded"
          >
            <option value="">Select Class</option>
            {classes.map((c) => (
              <option key={c.class_id} value={c.class_id}>
                {c.class_name}
              </option>
            ))}
          </select>

          <input
            name="first_name"
            placeholder="First Name"
            value={form.first_name}
            onChange={handleChange}
            className="border p-2 rounded"
          />
          <input
            name="last_name"
            placeholder="Last Name"
            value={form.last_name}
            onChange={handleChange}
            className="border p-2 rounded"
          />

          <select
            name="gender"
            value={form.gender}
            onChange={handleChange}
            className="border p-2 rounded"
          >
            <option value="">Select Gender</option>
            <option value="Female">Female</option>
          </select>

          <input
            name="date_of_birth"
            type="date"
            placeholder="Date of Birth"
            value={form.date_of_birth}
            onChange={handleChange}
            className="border p-2 rounded"
          />
          <select
            name="parent_id"
            value={form.parent_id}
            onChange={handleChange}
            className="border p-2 rounded"
          >
           <option value="">Select Guardian</option>
            {parents.map((p) => (
              <option key={p.parent_id} value={p.parent_id}>
                {p.name}
             </option>
           ))}
          </select>
        </div>

        <div className="mt-6 flex justify-end space-x-3">
          <button onClick={onClose} className="bg-gray-400 px-4 py-2 rounded text-white">
            Cancel
          </button>
          <button onClick={handleSubmit} className="bg-blue-600 px-4 py-2 rounded text-white">
            Save
          </button>
        </div>
      </div>
    </div>
  )
}
