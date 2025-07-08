/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect, useState } from 'react'
import axios from 'axios'
import AdminLayout from '../layouts/AdminLayout'

export default function AdminSettings() {
  // 🔧 Settings (year, term)
  const [currentYear, setCurrentYear] = useState('')
  const [currentTerm, setCurrentTerm] = useState('')

  // 👤 Profile info
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [profileMsg, setProfileMsg] = useState('')

  // 🔒 Password change
  const [currentPw, setCurrentPw] = useState('')
  const [newPw, setNewPw] = useState('')
  const [pwMessage, setPwMessage] = useState('')

  const fetchSettings = async () => {
    try {
      const settingsRes = await axios.get('http://localhost:5001/api/v1/settings')
      setCurrentYear(settingsRes.data.current_year || '')
      setCurrentTerm(settingsRes.data.current_term || '')

      const userRes = await axios.get('http://localhost:5001/api/v1/users/me')
      setName(userRes.data.name)
      setEmail(userRes.data.email)
    } catch (err) {
      console.error('Failed to load settings')
    }
  }

  const handleSaveSettings = async () => {
    try {
      await axios.put('http://localhost:5001/api/v1/settings', {
        current_year: currentYear,
        current_term: currentTerm,
      })
      alert('✅ Academic settings updated')
    } catch {
      alert('❌ Failed to update settings')
    }
  }

  const handleProfileSave = async () => {
    try {
      await axios.put('http://localhost:5001/api/v1/settings/profile', { name, email })
      setProfileMsg('✅ Profile updated')
    } catch {
      setProfileMsg('❌ Failed to update profile')
    }
  }

  const handlePasswordSave = async () => {
    try {
      await axios.put('http://localhost:5001/api/v1/settings/password', {
        current_password: currentPw,
        new_password: newPw,
      })
      setPwMessage('✅ Password changed')
      setCurrentPw('')
      setNewPw('')
    } catch (err: any) {
      setPwMessage(err.response?.data?.error || '❌ Failed to change password')
    }
  }

  useEffect(() => {
    fetchSettings()
  }, [])

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold mb-6">⚙️ Admin Settings</h1>

      {/* 📅 Academic Term/Year */}
      <div className="bg-white p-6 rounded shadow max-w-md space-y-4 mb-8">
        <h2 className="text-lg font-semibold">📅 Academic Settings</h2>
        <input
          value={currentYear}
          onChange={(e) => setCurrentYear(e.target.value)}
          placeholder="Academic Year (e.g., 2024)"
          className="w-full border p-2 rounded"
        />
        <select
          value={currentTerm}
          onChange={(e) => setCurrentTerm(e.target.value)}
          className="w-full border p-2 rounded"
        >
          <option>Term 1</option>
          <option>Term 2</option>
          <option>Term 3</option>
        </select>
        <button onClick={handleSaveSettings} className="bg-blue-600 text-white px-4 py-2 rounded">
          💾 Save Academic Settings
        </button>
      </div>

      {/* 👤 Profile Section */}
      <div className="bg-white p-6 rounded shadow max-w-md space-y-4 mb-8">
        <h2 className="text-lg font-semibold">👤 Profile Info</h2>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name"
          className="w-full border p-2 rounded"
        />
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="w-full border p-2 rounded"
        />
        <button onClick={handleProfileSave} className="bg-blue-600 text-white px-4 py-2 rounded">
          💾 Save Profile
        </button>
        {profileMsg && <p className="text-sm mt-2 text-gray-600">{profileMsg}</p>}
      </div>

      {/* 🔒 Password Section */}
      <div className="bg-white p-6 rounded shadow max-w-md space-y-4">
        <h2 className="text-lg font-semibold">🔒 Change Password</h2>
        <input
          type="password"
          value={currentPw}
          onChange={(e) => setCurrentPw(e.target.value)}
          placeholder="Current password"
          className="w-full border p-2 rounded"
        />
        <input
          type="password"
          value={newPw}
          onChange={(e) => setNewPw(e.target.value)}
          placeholder="New password"
          className="w-full border p-2 rounded"
        />
        <button onClick={handlePasswordSave} className="bg-blue-600 text-white px-4 py-2 rounded">
          🔐 Change Password
        </button>
        {pwMessage && <p className="text-sm mt-2 text-gray-600">{pwMessage}</p>}
      </div>
    </AdminLayout>
  )
}
