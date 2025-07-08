import { useEffect, useState } from 'react'
import axios from 'axios'
import TeacherLayout from '../layouts/TeacherLayout'

interface Message {
  id: number
  from: string
  content: string
  timestamp: string
}

export default function TeacherMessages() {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)

  const fetchMessages = async () => {
    try {
      const res = await axios.get('http://localhost:5001/api/v1/messages/inbox')
      setMessages(res.data)
    } catch (err) {
      console.error('Failed to fetch messages', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMessages()
  }, [])

  return (
    <TeacherLayout>
      <h1 className="text-2xl font-bold mb-4">📥 Messages Inbox</h1>

      {loading ? (
        <p>Loading messages...</p>
      ) : messages.length === 0 ? (
        <p className="text-gray-500">No messages received.</p>
      ) : (
        <ul className="space-y-4">
          {messages.map((m) => (
            <li key={m.id} className="bg-white p-4 rounded shadow">
              <p className="text-sm text-gray-600">
                From: <strong>{m.from}</strong> —{' '}
                {new Date(m.timestamp).toLocaleString()}
              </p>
              <p className="mt-2">{m.content}</p>
            </li>
          ))}
        </ul>
      )}
    </TeacherLayout>
  )
}
