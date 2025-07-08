import { useEffect, useState } from 'react'
import axios from 'axios'
import AdminLayout from '../layouts/AdminLayout'

export default function AdminSettings() {
  const [currentTerm, setCurrentTerm] = useState('')
  const [currentYear, setCurrentYear] = useState('')
  const [message, setMessage] = useState('')

  const fetchSettings = async () => {
    const res = await axios.get('http://localhost:5001/api/v1/settings')
    setCurrentTerm(res.data.current_term || '')
    setCurrentYear(res.data.current_year || '')
  }

  const handleSave = async () => {
    try {
      await axios.put('http://localhost:5001/api/v1/settings', {
        current_term: currentTerm,
        current_year: currentYear
      })
      setMessage('✅ Settings saved successfully.')
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      setMessage('❌ Failed to save settings.')
    }
  }

  useEffect(() => {
    fetchSettings()
  }, [])

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold mb-6">⚙️ Admin Settings</h1>

      <div className="bg-white p-6 rounded shadow max-w-md space-y-4">
        <div>
          <label className="block font-semibold mb-1">📅 Academic Year</label>
          <input
            type="number"
            value={currentYear}
            onChange={(e) => setCurrentYear(e.target.value)}
            className="w-full border p-2 rounded"
          />
        </div>

        <div>
          <label className="block font-semibold mb-1">📘 Term</label>
          <select
            value={currentTerm}
            onChange={(e) => setCurrentTerm(e.target.value)}
            className="w-full border p-2 rounded"
          >
            <option>Term 1</option>
            <option>Term 2</option>
            <option>Term 3</option>
          </select>
        </div>

        <button
          onClick={handleSave}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          💾 Save Settings
        </button>

        {message && <p className="text-sm text-gray-600 mt-2">{message}</p>}
      </div>
    </AdminLayout>
  )
}
