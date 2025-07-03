/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react'
import axios from 'axios'

interface Props {
  onClose: () => void
  onSaved: () => void
  student?: any // used in edit mode
}

export default function StudentForm({ onClose, onSaved, student }: Props) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [admissionNumber, setAdmissionNumber] = useState('')
  const [classId, setClassId] = useState<number | ''>('')
  const [classOptions, setClassOptions] = useState([])

  useEffect(() => {
    axios.get('http://127.0.0.1:5001/api/v1/classrooms').then(res => setClassOptions(res.data))

    if (student) {
      setName(student.user.name)
      setEmail(student.user.email)
      setAdmissionNumber(student.admission_number)
      setClassId(student.class_id)
    }
  }, [student])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const payload = {
      name,
      email,
      admission_number: admissionNumber,
      class_id: classId
    }

    if (student) {
      await axios.put(`http://127.0.0.1:5001/api/v1/students/${student.student_id}`, payload)
    } else {
      await axios.post('http://127.0.0.1:5001/api/v1/students', payload)
    }

    onSaved()
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded shadow w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">{student ? 'Edit Student' : 'Add Student'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full border p-2 rounded"
            placeholder="Name"
            required
          />
          <input
            value={email}
            onChange={e => setEmail(e.target.value)}
            type="email"
            className="w-full border p-2 rounded"
            placeholder="Email"
            required
          />
          <input
            value={admissionNumber}
            onChange={e => setAdmissionNumber(e.target.value)}
            className="w-full border p-2 rounded"
            placeholder="Admission Number"
            required
          />
          <select
            value={classId}
            onChange={e => setClassId(Number(e.target.value))}
            className="w-full border p-2 rounded"
            required
          >
            <option value="">Select Class</option>
            {classOptions.map((c: any) => (
              <option key={c.class_id} value={c.class_id}>{c.class_name}</option>
            ))}
          </select>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose} className="px-4 py-2 border rounded">
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">
              {student ? 'Update' : 'Add'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
