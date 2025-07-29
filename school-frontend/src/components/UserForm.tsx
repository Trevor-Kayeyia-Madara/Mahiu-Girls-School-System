/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react'
import axios from 'axios'

interface Props {
  user?: any
  onClose: () => void
  onSaved: () => void
}

export default function UserForm({ user, onClose, onSaved }: Props) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('')
  const [password, setPassword] = useState('')

  // Teacher-specific fields
  const [gender, setGender] = useState('')
  const [contact, setContact] = useState('')
  const [dateOfBirth, setDateOfBirth] = useState('')
  const [qualifications, setQualifications] = useState('')

  useEffect(() => {
    if (user) {
      setName(user.name)
      setEmail(user.email)
      setRole(user.role)
    }
  }, [user])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const token = localStorage.getItem('token')
    const headers = { Authorization: `Bearer ${token}` }

    try {
      if (user) {
        await axios.put(`http://localhost:5001/api/v1/users/${user.user_id}`, {
          name, email, role
        }, { headers })
      } else {
        if (role === 'teacher') {
          await axios.post(`http://localhost:5001/api/v1/teachers`, {
            name,
            email,
            password,
            gender,
            contact,
            date_of_birth: dateOfBirth,
            qualifications,
          }, { headers })
        } else {
          await axios.post(`http://localhost:5001/api/v1/users`, {
            name, email, password, role
          }, { headers })
        }
      }

      onSaved()
      onClose()
    } catch (error: any) {
      console.error('Error saving user and/or teacher:', error)
      if (axios.isAxiosError(error)) {
        alert(error.response?.data?.error || 'Something went wrong.')
      }
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded shadow w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">{user ? 'Edit User' : 'Add User'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border p-2 rounded"
            placeholder="Full Name"
            required
          />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border p-2 rounded"
            placeholder="Email"
            required
          />
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full border p-2 rounded"
            required
          >
            <option value="">-- Select Role --</option>
            <option value="admin">Admin</option>
            <option value="teacher">Teacher</option>
            <option value="parent">Parent</option>
          </select>

          {!user && (
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border p-2 rounded"
              placeholder="Password"
              required
            />
          )}

          {role === 'teacher' && !user && (
            <>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full border p-2 rounded"
              >
                <option value="">-- Select Gender --</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>

              <input
                type="text"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                className="w-full border p-2 rounded"
                placeholder="Contact"
              />

              <input
                type="date"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                className="w-full border p-2 rounded"
                placeholder="Date of Birth"
              />

              <input
                type="text"
                value={qualifications}
                onChange={(e) => setQualifications(e.target.value)}
                className="w-full border p-2 rounded"
                placeholder="Qualifications"
              />
            </>
          )}

          <div className="flex justify-end space-x-2">
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
              {user ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
