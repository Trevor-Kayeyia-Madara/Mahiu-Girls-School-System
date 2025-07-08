/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react'
import axios from 'axios'
import AdminLayout from '../layouts/AdminLayout'
import {
  DragDropContext,
  Droppable,
  Draggable
} from '@hello-pangea/dnd'
import type { DropResult } from '@hello-pangea/dnd'


interface Classroom {
  class_id: number
  class_name: string
}

interface Subject {
  subject_id: number
  name: string
}

interface TimetableEntry {
  id: number
  day: string
  start_time: string
  end_time: string
  subject: string
  teacher: string
  subject_id: number
  teacher_id: number
}

const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']

export default function AdminTimetable() {
  const [classes, setClasses] = useState<Classroom[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [selectedClass, setSelectedClass] = useState<number | null>(null)
  const [timetable, setTimetable] = useState<TimetableEntry[]>([])
  const [formData, setFormData] = useState({
    day: 'Monday',
    start_time: '08:00',
    end_time: '09:00',
    subject_id: '',
  })

  useEffect(() => {
    const fetchMeta = async () => {
      const [clsRes, subjRes] = await Promise.all([
        axios.get('http://localhost:5001/api/v1/classrooms'),
        axios.get('http://localhost:5001/api/v1/subjects')
      ])
      setClasses(clsRes.data)
      setSubjects(subjRes.data)
    }
    fetchMeta()
  }, [])

  const fetchTimetable = async (class_id: number) => {
    const res = await axios.get(`http://localhost:5001/api/v1/timetable/${class_id}`)
    setTimetable(res.data)
  }

  const handleClassChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const class_id = parseInt(e.target.value)
    setSelectedClass(class_id)
    fetchTimetable(class_id)
  }

const handleAdd = async () => {
  if (selectedClass === null) return  // ✅ Guard clause

  try {
    await axios.post('http://localhost:5001/api/v1/timetable', {
      class_id: selectedClass,
      ...formData
    })
    fetchTimetable(selectedClass)
  } catch (err: any) {
    alert(err.response?.data?.error || 'Failed to add slot')
  }
}

  const handleDelete = async (id: number) => {
    await axios.delete(`http://localhost:5001/api/v1/timetable/${id}`)
    if (selectedClass) fetchTimetable(selectedClass)
  }
const handleDragEnd = (result: DropResult) => {
  if (!result.destination) return

  const reordered = Array.from(timetable)
  const [moved] = reordered.splice(result.source.index, 1)
  reordered.splice(result.destination.index, 0, moved)

  setTimetable(reordered)
}
const groupTimetableByDayAndTime = (entries: TimetableEntry[]) => {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
  const timeMap: Record<string, Record<string, TimetableEntry | null>> = {}

  const allTimes = new Set<string>()

  for (const entry of entries) {
    const timeSlot = `${entry.start_time} - ${entry.end_time}`
    allTimes.add(timeSlot)

    if (!timeMap[timeSlot]) {
      timeMap[timeSlot] = {}
    }

    timeMap[timeSlot][entry.day] = entry
  }

  const sortedTimes = Array.from(allTimes).sort()

  return { sortedTimes, timeMap, days }
}
const grouped = groupTimetableByDayAndTime(timetable)

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold mb-4">🕒 Timetabling</h1>

      <div className="mb-6">
        <label className="mr-2 font-medium">Select Class:</label>
        <select
          value={selectedClass || ''}
          onChange={handleClassChange}
          className="border p-2 rounded"
        >
          <option value="">-- Select --</option>
          {classes.map((cls) => (
            <option key={cls.class_id} value={cls.class_id}>
              {cls.class_name}
            </option>
          ))}
        </select>
      </div>

      {selectedClass && (
        <>
          <div className="mb-4 bg-white shadow rounded p-4">
            <h2 className="text-lg font-semibold mb-2">➕ Add Slot</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <select
                value={formData.day}
                onChange={(e) => setFormData({ ...formData, day: e.target.value })}
                className="border p-2 rounded"
              >
                {weekdays.map((d) => (
                  <option key={d}>{d}</option>
                ))}
              </select>
              <input
                type="time"
                value={formData.start_time}
                onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                className="border p-2 rounded"
              />
              <input
                type="time"
                value={formData.end_time}
                onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                className="border p-2 rounded"
              />
              <select
                value={formData.subject_id}
                onChange={(e) => setFormData({ ...formData, subject_id: e.target.value })}
                className="border p-2 rounded"
              >
                <option value="">-- Select Subject --</option>
                {subjects.map((s) => (
                  <option key={s.subject_id} value={s.subject_id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={handleAdd}
              className="mt-3 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Add to Timetable
            </button>
            <button
                onClick={async () => {
                  const res = await axios.get(
                    `http://localhost:5001/api/v1/timetable/export/${selectedClass}`,
                    { responseType: 'blob' }
                  )
                  const url = window.URL.createObjectURL(new Blob([res.data]))
                  const link = document.createElement('a')
                  link.href = url
                  link.setAttribute('download', 'class_timetable.pdf')
                  document.body.appendChild(link)
                  link.click()
                }}
                className="mb-4 ml-4 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
              >
                🧾 Export to PDF
        </button>
          </div>
                {selectedClass && (
  <>
    {/* ...Add Slot Form & Button */}

    <div className="overflow-x-auto mt-6">
      <h2 className="text-xl font-semibold mb-2">📅 Weekly Timetable</h2>

      <table className="w-full table-fixed border bg-white text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="w-32 p-2 border">Time</th>
            {grouped.days.map((day) => (
              <th key={day} className="w-1/5 p-2 border">{day}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {grouped.sortedTimes.map((time) => (
            <tr key={time}>
              <td className="border p-2 font-semibold">{time}</td>
              {grouped.days.map((day) => {
                const entry = grouped.timeMap[time]?.[day]
                return (
                  <td key={day} className="border p-2 align-top">
                    {entry ? (
                      <>
                        <div className="font-medium">{entry.subject}</div>
                        <div className="text-xs text-gray-600">{entry.teacher || '—'}</div>
                      </>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </>
)}

          {/* Timetable Grid */}
          <div className="overflow-x-auto">
            <table className="w-full table-auto bg-white shadow rounded text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-2">Day</th>
                  <th className="p-2">Time</th>
                  <th className="p-2">Subject</th>
                  <th className="p-2">Teacher</th>
                  <th className="p-2">Action</th>
                </tr>
              </thead>
              <DragDropContext onDragEnd={handleDragEnd}>
  <Droppable droppableId="timetable">
    {(provided) => (
      <tbody ref={provided.innerRef} {...provided.droppableProps}>
        {timetable.map((slot, index) => (
          <Draggable key={slot.id} draggableId={String(slot.id)} index={index}>
            {(provided) => (
              <tr
                ref={provided.innerRef}
                {...provided.draggableProps}
                {...provided.dragHandleProps}
                className="border-t bg-white hover:bg-gray-50"
              >
                <td className="p-2">{slot.day}</td>
                <td className="p-2">{slot.start_time} - {slot.end_time}</td>
                <td className="p-2">{slot.subject}</td>
                <td className="p-2">{slot.teacher || 'N/A'}</td>
                <td className="p-2">
                  <button
                    onClick={() => handleDelete(slot.id)}
                    className="text-red-600 hover:underline"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            )}
          </Draggable>
        ))}
        {provided.placeholder}
      </tbody>
    )}
  </Droppable>
</DragDropContext>

            </table>
          </div>
        </>
      )}
    </AdminLayout>
  )
}
