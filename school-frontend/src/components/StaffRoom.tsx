import { useState, useEffect } from 'react'
import axios from 'axios'
import type { Staff } from '../types/Staff'

interface Props {
  staff: Staff | null
  onClose: () => void
  onSaved: () => void
}

export default function StaffForm({ staff, onClose, onSaved }: Props) {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    gender: '',
    contact: '',
    role: '',
    date_of_birth: '',
    qualifications: '',
  })

  // Populate form when editing
  useEffect(() => {
    if (staff) {
      setForm({
        name: staff.user?.name || '',
        email: staff.user?.email || '',
        password: '', // Do not prefill password
        gender: staff.gender || '',
        contact: staff.contact || '',
        role: staff.role || '',
        date_of_birth: staff.date_of_birth || '',
        qualifications: staff.qualifications || '',
      })
    }
  }, [staff])

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  try {
    let payload
    if (staff) {
      // omit password if blank
      const { password, ...rest } = form
      payload = password ? { ...rest, password } : rest
      await axios.put(`http://localhost:5001/api/v1/staff/${staff.staff_id}`, payload)
    } else {
      await axios.post('http://localhost:5001/api/v1/staff', form)
    }
    onSaved()
    onClose()
  } catch (err) {
    console.error('Failed to save staff:', err)
    alert('Error saving staff. Check console.')
  }
}


  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded shadow w-full max-w-md space-y-4"
      >
        <h2 className="text-xl font-bold">
          {staff ? 'Edit Teacher' : 'Add Teacher'}
        </h2>

        <input
          type="text"
          placeholder="Full Name"
          className="w-full border p-2 rounded"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />

        <input
          type="email"
          placeholder="Email"
          className="w-full border p-2 rounded"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
        />

        {!staff && (
          <input
            type="password"
            placeholder="Password"
            className="w-full border p-2 rounded"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
          />
        )}

        <input
          type="date"
          className="w-full border p-2 rounded"
          value={form.date_of_birth}
          onChange={(e) => setForm({ ...form, date_of_birth: e.target.value })}
          required
        />

        <input
          type="text"
          placeholder="Qualifications"
          className="w-full border p-2 rounded"
          value={form.qualifications}
          onChange={(e) => setForm({ ...form, qualifications: e.target.value })}
        />

        <select
          className="w-full border p-2 rounded"
          value={form.gender}
          onChange={(e) => setForm({ ...form, gender: e.target.value })}
          required
        >
          <option value="">Select Gender</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
        </select>

        <input
          type="text"
          placeholder="Contact Number"
          className="w-full border p-2 rounded"
          value={form.contact}
          onChange={(e) => setForm({ ...form, contact: e.target.value })}
          required
        />

        <select
          className="w-full border p-2 rounded"
          value={form.role}
          onChange={(e) => setForm({ ...form, role: e.target.value })}
          required
        >
          <option value="">Select Role</option>
          <option value="teacher">Teacher</option>
          <option value="admin">Admin</option>
        </select>

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border rounded"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            Save
          </button>
        </div>
      </form>
    </div>
  )
}
