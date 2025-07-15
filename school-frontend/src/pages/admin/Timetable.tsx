/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from 'react'
import axios from 'axios'
import jsPDF from 'jspdf'
import { autoTable , type CellDef} from 'jspdf-autotable'
import { unparse } from 'papaparse'

interface TimetableEntry {
  id?: number
  class_id: number
  day: string
  start_time: string
  end_time: string
  subject: string
  subject_id: number
  teacher: string
  teacher_id: number
}

interface Subject {
  subject_id: number
  name: string
}

interface Teacher {
  teacher_id: number
  name: string
}

interface Classroom {
  class_id: number
  class_name: string
}

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']

const times = [
  { start: '08:00', end: '08:40' },
  { start: '08:40', end: '09:20' },
  { start: '09:20', end: '09:25', type: 'short-break' },
  { start: '09:25', end: '10:05' },
  { start: '10:05', end: '10:35', type: 'tea-break' },
  { start: '10:35', end: '11:15' },
  { start: '11:15', end: '11:45' },
  { start: '11:45', end: '12:25' },
  { start: '12:25', end: '13:15', type: 'lunch' },
  { start: '13:15', end: '13:55' },
  { start: '13:55', end: '14:35' },
  { start: '14:35', end: '14:45', type: 'short-break' },
  { start: '14:45', end: '15:25' },
  { start: '15:25', end: '15:45' },
]

export default function AdminTimetable() {
  const [selectedClass, setSelectedClass] = useState<number | null>(null)
  const [classrooms, setClassrooms] = useState<Classroom[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [entries, setEntries] = useState<TimetableEntry[]>([])
  const [editingId, setEditingId] = useState<number | null>(null)

  const token = localStorage.getItem('token')
  const headers = { Authorization: `Bearer ${token}` }

  const fetchMeta = async () => {
    const [classRes, subRes, teacherRes] = await Promise.all([
      axios.get('http://localhost:5001/api/v1/classrooms', { headers }),
      axios.get('http://localhost:5001/api/v1/subjects', { headers }),
      axios.get('http://localhost:5001/api/v1/teachers', { headers }),
    ])
    setClassrooms(classRes.data)
    setSubjects(subRes.data)
    setTeachers(teacherRes.data)
  }

  const fetchTimetable = async (classId: number) => {
    const res = await axios.get(`http://localhost:5001/api/v1/timetable/class/${classId}`, { headers })
    setEntries(res.data)
  }

  useEffect(() => {
    fetchMeta()
  }, [])

  useEffect(() => {
    if (selectedClass) {
      fetchTimetable(selectedClass)
    }
  }, [selectedClass])

  const handleSave = async (
    { subject_id, teacher_id }: { subject_id: number; teacher_id: number },
    day: string,
    time: { start: string; end: string },
    id?: number
  ) => {
    if (!selectedClass) return

    const data = {
      class_id: selectedClass,
      day,
      start_time: time.start,
      end_time: time.end,
      subject_id,
      teacher_id,
    }

    try {
      if (id) {
        await axios.put(`http://localhost:5001/api/v1/timetable/${id}`, data, { headers })
      } else {
        await axios.post('http://localhost:5001/api/v1/timetable', data, { headers })
      }
      setEditingId(null)
      fetchTimetable(selectedClass)
    } catch (err) {
      console.error('Save failed', err)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this entry?')) return
    try {
      await axios.delete(`http://localhost:5001/api/v1/timetable/${id}`, { headers })
      fetchTimetable(selectedClass!)
    } catch (err) {
      console.error('Delete failed', err)
    }
  }

  const renderCell = (day: string, time: { start: string; end: string; type?: string }) => {
    const key = `${day}-${time.start}`
    if (time.type) {
      return (
        <td className="border p-1 text-xs italic text-gray-500 text-center bg-gray-50" key={key}>
          {{
            'short-break': 'Short Break',
            'tea-break': 'Tea Break',
            'lunch': 'Lunch Break',
          }[time.type] || 'Break'}
        </td>
      )
    }

    const match = entries.find(e => e.day === day && e.start_time === time.start && e.end_time === time.end)

    if (match && editingId === match.id) {
      return (
        <td className="border p-1 text-sm" key={key}>
          <InlineEditor
            subjects={subjects}
            teachers={teachers}
            initialSubjectId={match.subject_id}
            initialTeacherId={match.teacher_id}
            onSave={(s, t) => handleSave({ subject_id: s, teacher_id: t }, day, time, match.id)}
            onCancel={() => setEditingId(null)}
          />
        </td>
      )
    }

    if (match) {
      return (
        <td className="border p-1 text-sm" key={key}>
          <div>
            <div className="font-medium">{match.subject}</div>
            <div className="text-xs text-gray-500">{match.teacher}</div>
            <div className="mt-1 flex gap-1 text-xs">
              <button className="text-blue-600" onClick={() => setEditingId(match.id!)}>✏️</button>
              <button className="text-red-600" onClick={() => handleDelete(match.id!)}>🗑️</button>
            </div>
          </div>
        </td>
      )
    }

    return (
      <td className="border p-1 text-sm" key={key}>
        <InlineEditor
          subjects={subjects}
          teachers={teachers}
          onSave={(s, t) => handleSave({ subject_id: s, teacher_id: t }, day, time)}
        />
      </td>
    )
  }
const exportToPDF = () => {
  if (!selectedClass) return

  const doc = new jsPDF()
  doc.text("Class Timetable", 14, 15)

  const headerRow: CellDef[] = [
    {
      content: "Day / Time",
      styles: {
        halign: 'center' as const,
        fillColor: [22, 160, 133] as [number, number, number]
      }
    },
    ...times.map(t => ({
      content: `${t.start} - ${t.end}`,
      styles: {
        halign: 'center' as const,
        fillColor: [22, 160, 133] as [number, number, number]
      }
    }))
  ]

  const body = days.map(day => {
    const row: CellDef[] = [
      {
        content: day,
        styles: {
          fontStyle: 'bold',
          fillColor: [245, 245, 245] as [number, number, number]
        }
      }
    ]

    times.forEach(t => {
      if (t.type) {
        row.push({
          content:
            {
              'short-break': 'Short Break',
              'tea-break': 'Tea Break',
              lunch: 'Lunch Break'
            }[t.type] || 'Break',
          styles: {
            fontStyle: 'bold',
            textColor: 100
          }
        })
      } else {
        const match = entries.find(
          e => e.day === day && e.start_time === t.start && e.end_time === t.end
        )
        row.push({
          content: match ? `${match.subject} (${match.teacher})` : ''
        })
      }
    })

    return row
  })

  autoTable(doc, {
    head: [headerRow],
    body,
    startY: 20,
    styles: { fontSize: 7 },
    headStyles: { fillColor: [22, 160, 133] },
    theme: 'grid'
  })

  doc.save(`class-${selectedClass}-timetable.pdf`)
}

  const exportToCSV = () => {
    if (!selectedClass) return

    const rows = days.map(day => {
      const row: Record<string, string> = { Day: day }
      times.forEach(t => {
        const timeLabel = `${t.start}-${t.end}`
        if (t.type) {
          row[timeLabel] = {
            'short-break': 'Short Break',
            'tea-break': 'Tea Break',
            'lunch': 'Lunch Break',
          }[t.type] || 'Break'
        } else {
          const match = entries.find(e => e.day === day && e.start_time === t.start && e.end_time === t.end)
          row[timeLabel] = match ? `${match.subject} (${match.teacher})` : ''
        }
      })
      return row
    })

    const csv = unparse(rows)
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.setAttribute("download", `class-${selectedClass}-timetable.csv`)
    link.click()
  }

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">🗓️ Admin Timetable</h1>

      <select
        value={selectedClass ?? ''}
        onChange={(e) => setSelectedClass(Number(e.target.value))}
        className="mb-4 p-2 border rounded"
      >
        <option value="">-- Select Class --</option>
        {classrooms.map((c) => (
          <option key={c.class_id} value={c.class_id}>{c.class_name}</option>
        ))}
      </select>

      {selectedClass && (
        <>
          <div className="flex gap-2 mb-4">
            <button onClick={exportToPDF} className="bg-red-500 text-white px-3 py-1 text-sm rounded">
              Export PDF
            </button>
            <button onClick={exportToCSV} className="bg-green-500 text-white px-3 py-1 text-sm rounded">
              Export CSV
            </button>
          </div>

          <div className="overflow-auto">
            <table className="w-full border-collapse bg-white shadow text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-2 border">Day / Time</th>
                  {times.map((t, idx) => (
                    <th key={idx} className="p-2 border text-xs">
                      {t.start} - {t.end}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {days.map((day) => (
                  <tr key={day}>
                    <td className="border p-2 font-semibold bg-gray-50">{day}</td>
                    {times.map((t) => renderCell(day, t))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}

// === InlineEditor Component ===
function InlineEditor({
  subjects,
  teachers,
  onSave,
  onCancel,
  initialSubjectId,
  initialTeacherId,
}: {
  subjects: Subject[]
  teachers: Teacher[]
  onSave: (subjectId: number, teacherId: number) => void
  onCancel?: () => void
  initialSubjectId?: number
  initialTeacherId?: number
}) {
  const [subjectId, setSubjectId] = useState<number | ''>(initialSubjectId ?? '')
  const [teacherId, setTeacherId] = useState<number | ''>(initialTeacherId ?? '')

  const valid = subjectId && teacherId

  return (
    <div className="space-y-1">
      <select
        className="w-full border rounded text-xs"
        value={subjectId}
        onChange={(e) => setSubjectId(Number(e.target.value))}
      >
        <option value="">-- Subject --</option>
        {subjects.map((s) => (
          <option key={s.subject_id} value={s.subject_id}>
            {s.name}
          </option>
        ))}
      </select>

      <select
        className="w-full border rounded text-xs"
        value={teacherId}
        onChange={(e) => setTeacherId(Number(e.target.value))}
      >
        <option value="">-- Teacher --</option>
        {teachers.map((t) => (
          <option key={t.teacher_id} value={t.teacher_id}>
            {t.name}
          </option>
        ))}
      </select>

      <div className="flex justify-between items-center gap-1 mt-1">
        <button
          className="bg-blue-500 text-white px-2 py-1 text-xs rounded w-full"
          disabled={!valid}
          onClick={() => valid && onSave(Number(subjectId), Number(teacherId))}
        >
          Save
        </button>
        {onCancel && (
          <button
            className="bg-gray-300 text-black px-2 py-1 text-xs rounded"
            onClick={onCancel}
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  )
}
