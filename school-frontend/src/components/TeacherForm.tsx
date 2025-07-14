import { useState } from 'react'
import axios from 'axios'

interface Teacher {
  teacher_id: number
  name: string
  email: string
  gender?: string
  contact?: string
  date_of_birth?:string
  qualifications?: string
}

interface TeacherFormProps {
  teacher: Teacher | null
  onClose: () => void
  onSaved: () => void
}

export default function TeacherForm({ teacher, onClose, onSaved }: TeacherFormProps) {
  const [formData, setFormData] = useState({
    name: teacher?.name || '',
    email: teacher?.email || '',
    password: '',
    gender: teacher?.gender || '',
    contact: teacher?.contact || '',
    date_of_birth: teacher?.date_of_birth || '',
    qualifications: teacher?.qualifications || '',
  })

  const [showPassword, setShowPassword] = useState(false)
  const [passwordError, setPasswordError] = useState('')
  const [generatedPassword, setGeneratedPassword] = useState('')
  const [showModal, setShowModal] = useState(false)

  const handleGeneratePassword = () => {
    const randomPassword = Math.random().toString(36).slice(-8)
    setFormData({ ...formData, password: randomPassword })
    setPasswordError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const token = localStorage.getItem('token')

    if (!teacher && formData.password.length < 6) {
      setPasswordError('Password must be at least 6 characters long')
      return
    }

    try {
      if (teacher) {
        await axios.put(`http://localhost:5001/api/v1/teachers/${teacher.teacher_id}`, formData, {
          headers: { Authorization: `Bearer ${token}` },
        })
        onSaved()
        onClose()
      } else {

        // Show modal with password
        setGeneratedPassword(formData.password)
        setShowModal(true)
        onSaved()
      }
    } catch (err) {
      console.error('Error saving teacher:', err)
    }
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow w-full max-w-md mx-auto">
        <h2 className="text-xl font-bold mb-4">{teacher ? 'Edit Teacher' : 'Add Teacher'}</h2>

        {/* Name */}
        <div className="mb-4">
          <label className="block mb-1 font-medium">Name</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full border px-3 py-2 rounded"
            required
          />
        </div>

        {/* Email */}
        <div className="mb-4">
          <label className="block mb-1 font-medium">Email</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full border px-3 py-2 rounded"
            required
          />
        </div>

        {/* Password */}
        {!teacher && (
          <div className="mb-4">
            <label className="block mb-1 font-medium">Password</label>
            <div className="flex items-center space-x-2">
              <input
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => {
                  setFormData({ ...formData, password: e.target.value })
                  setPasswordError('')
                }}
                className="w-full border px-3 py-2 rounded"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="text-sm text-blue-600"
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
              <button
                type="button"
                onClick={handleGeneratePassword}
                className="text-sm text-green-600"
              >
                Generate
              </button>
            </div>
            {passwordError && <p className="text-red-500 text-sm mt-1">{passwordError}</p>}
          </div>
        )}

        {/* Gender */}
        <div className="mb-4">
          <label className="block mb-1 font-medium">Gender</label>
          <input
            type="text"
            value={formData.gender}
            onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
            className="w-full border px-3 py-2 rounded"
          />
        </div>

        {/* Contact */}
        <div className="mb-4">
          <label className="block mb-1 font-medium">Contact</label>
          <input
            type="text"
            value={formData.contact}
            onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
            className="w-full border px-3 py-2 rounded"
          />
        </div>

        {/* Qualifications */}
        <div className="mb-4">
          <label className="block mb-1 font-medium">Qualifications</label>
          <input
            type="text"
            value={formData.qualifications}
            onChange={(e) => setFormData({ ...formData, qualifications: e.target.value })}
            className="w-full border px-3 py-2 rounded"
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-2">
          <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-300 rounded">
            Cancel
          </button>
          <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">
            {teacher ? 'Update' : 'Create'}
          </button>
        </div>
      </form>

      {/* ✅ Modal for showing the generated password */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-sm">
            <h2 className="text-lg font-semibold mb-2">Teacher Created</h2>
            <p className="mb-2">Here is the generated password:</p>
            <div className="bg-gray-100 p-2 rounded font-mono text-center mb-4">
              {generatedPassword}
            </div>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(generatedPassword)
                }}
                className="px-3 py-1 bg-green-500 text-white rounded"
              >
                Copy
              </button>
              <button
                onClick={() => {
                  setShowModal(false)
                  onClose()
                }}
                className="px-3 py-1 bg-blue-500 text-white rounded"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
