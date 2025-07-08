import { useState, useEffect } from 'react'
import axios from 'axios'
import AdminLayout from '../layouts/AdminLayout'

interface Announcement {
  id: number
  title: string
  content: string
  created_at: string
}

export default function AdminAnnouncements() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [message, setMessage] = useState('')

  const fetchAnnouncements = async () => {
    const res = await axios.get('http://localhost:5001/api/v1/announcements')
    setAnnouncements(res.data)
  }

  const handlePost = async () => {
    try {
      await axios.post('http://localhost:5001/api/v1/announcements', { title, content })
      setMessage('✅ Announcement posted')
      setTitle('')
      setContent('')
      fetchAnnouncements()
    } catch {
      setMessage('❌ Failed to post announcement')
    }
  }

  useEffect(() => {
    fetchAnnouncements()
  }, [])

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold mb-4">📣 Announcements</h1>

      {/* Form */}
      <div className="bg-white p-6 rounded shadow max-w-xl mb-6 space-y-4">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
          className="w-full border p-2 rounded"
        />
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Message content"
          className="w-full border p-2 rounded h-28"
        />
        <button onClick={handlePost} className="bg-blue-600 text-white px-4 py-2 rounded">
          ➕ Post Announcement
        </button>
        {message && <p className="text-sm text-gray-600">{message}</p>}
      </div>

      {/* List */}
      <div className="space-y-4">
        {announcements.map((a) => (
          <div key={a.id} className="bg-white p-4 rounded shadow">
            <h2 className="font-bold text-lg">{a.title}</h2>
            <p className="text-sm text-gray-600 mb-2">{new Date(a.created_at).toLocaleString()}</p>
            <p>{a.content}</p>
          </div>
        ))}
        {announcements.length === 0 && (
          <p className="text-gray-500">No announcements posted yet.</p>
        )}
      </div>
    </AdminLayout>
  )
}
