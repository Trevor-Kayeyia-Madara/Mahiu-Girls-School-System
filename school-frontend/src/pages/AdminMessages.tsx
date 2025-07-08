import { useEffect, useState } from 'react'
import axios from 'axios'
import AdminLayout from '../layouts/AdminLayout'

interface User {
  user_id: number
  name: string
  email: string
  role: string
}

interface SentMessage {
  id: number
  to: string
  content: string
  timestamp: string
}

export default function AdminMessages() {
  const [users, setUsers] = useState<User[]>([])
  const [receiverId, setReceiverId] = useState<number | null>(null)
  const [content, setContent] = useState('')
  const [sent, setSent] = useState<SentMessage[]>([])
  const [msg, setMsg] = useState('')

  const fetchUsers = async () => {
    const res = await axios.get('http://localhost:5001/api/v1/users')
    setUsers(res.data.filter((u: User) => u.role !== 'admin'))
  }

  const fetchSent = async () => {
    const res = await axios.get('http://localhost:5001/api/v1/messages/sent')
    setSent(res.data)
  }

  const handleSend = async () => {
    if (!receiverId || !content) return

    try {
      await axios.post('http://localhost:5001/api/v1/messages', {
        receiver_id: receiverId,
        content,
      })
      setMsg('✅ Message sent')
      setContent('')
      fetchSent()
    } catch {
      setMsg('❌ Failed to send message')
    }
  }

  useEffect(() => {
    fetchUsers()
    fetchSent()
  }, [])

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold mb-6">✉️ Admin Messages</h1>

      {/* Form */}
      <div className="bg-white p-6 rounded shadow max-w-xl mb-6 space-y-4">
        <select
          value={receiverId ?? ''}
          onChange={(e) => setReceiverId(Number(e.target.value))}
          className="w-full border p-2 rounded"
        >
          <option value="">Select recipient</option>
          {users.map((u) => (
            <option key={u.user_id} value={u.user_id}>
              {u.name} ({u.role})
            </option>
          ))}
        </select>

        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write your message here"
          className="w-full border p-2 rounded h-28"
        />
        <button onClick={handleSend} className="bg-blue-600 text-white px-4 py-2 rounded">
          📤 Send Message
        </button>
        {msg && <p className="text-sm text-gray-600">{msg}</p>}
      </div>

      {/* Sent Messages */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold mb-2">📬 Sent Messages</h2>
        {sent.map((m) => (
          <div key={m.id} className="bg-white p-4 rounded shadow">
            <p className="text-sm text-gray-600 mb-1">
              To: {m.to} • {new Date(m.timestamp).toLocaleString()}
            </p>
            <p>{m.content}</p>
          </div>
        ))}
        {sent.length === 0 && (
          <p className="text-gray-500">No messages sent yet.</p>
        )}
      </div>
    </AdminLayout>
  )
}
