
// src/components/TeacherForm.tsx

import { useState } from 'react'
import axios from 'axios'

interface Props {
  teacher: Teacher | null // Keep this interface, but be aware of its usage
  onClose: () => void
  onSaved: () => void
}

// Ensure Teacher interface is available here if not in a shared type file
interface Teacher {
  teacher_id?: number // Make optional for new teachers
  name: string
  email: string
  employee_number?: string // Make optional as it's auto-generated
  gender: string
  contact: string
  qualifications: string
  // Add user_id if you pass it from the frontend to link to a user
  user_id?: number
}


export default function TeacherForm({ teacher, onClose, onSaved }: Props) {
  const [form, setForm] = useState({
    name: teacher?.name || '',
    email: teacher?.email || '',
    // employee_number: teacher?.employee_number || '', // REMOVE or make read-only for new
    gender: teacher?.gender || '',
    contact: teacher?.contact || '',
    qualifications: teacher?.qualifications || '',
    // If user_id is part of the form submission for new teachers:
    // user_id: teacher?.user_id || undefined,
  })

  // State for employee_number if you want to display it read-only
  const [displayEmployeeNumber] = useState(teacher?.employee_number || '');


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const token = localStorage.getItem('token')
      if (teacher) {
        await axios.put(`http://localhost:5001/api/v1/teachers/${teacher.teacher_id}`, form)
      } else {
        // When adding, DO NOT send employee_number as it's auto-generated
        await axios.post('http://localhost:5001/api/v1/teachers/', form,  {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
      }
      onSaved()
      onClose()
    } catch (err) {
      console.error('Error saving teacher:', err)
      // Check for specific error messages from backend if possible
      alert('Error saving teacher. Please check the console for details.')
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center">
      <div className="bg-white p-6 rounded shadow w-full max-w-md relative">
        <h2 className="text-lg font-bold mb-4">{teacher ? '✏️ Edit' : '➕ Add'} Teacher</h2>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={form.name}
            onChange={handleChange}
            className="w-full border p-2 rounded"
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            className="w-full border p-2 rounded"
            required
          />

          {/* Display employee_number read-only if editing, or a placeholder for new */}
          {teacher ? (
            <input
              type="text"
              name="employee_number"
              placeholder="Employee Number (Auto-generated)"
              value={displayEmployeeNumber}
              className="w-full border p-2 rounded bg-gray-100 cursor-not-allowed"
              readOnly
              disabled // Makes it non-editable and visually distinct
            />
          ) : (
            <input
              type="text"
              name="employee_number"
              placeholder="Employee Number (Auto-generated)"
              value="Will be auto-generated" // Placeholder for new
              className="w-full border p-2 rounded bg-gray-50 text-gray-400"
              readOnly
              disabled
            />
          )}

          <select
            name="gender"
            value={form.gender}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          >
            <option value="">-- Select Gender --</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
          <input
            type="text"
            name="contact"
            placeholder="Contact"
            value={form.contact}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />
          <input
            type="text"
            name="qualifications"
            placeholder="Qualifications"
            value={form.qualifications}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />

          <div className="flex justify-end space-x-2 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-300 rounded">
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded">
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}