import { useEffect, useState, type FormEvent } from 'react';
import axios from 'axios';

const API_BASE = 'http://localhost:5001/api/v1';

interface Subject {
  subject_id: number;
  name: string;
}

interface AssignedSubject {
  subject_id: number;
  subject_name: string;
}

export default function TeacherSubjects() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubjects, setSelectedSubjects] = useState<number[]>([]);
  const [assignedSubjects, setAssignedSubjects] = useState<AssignedSubject[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string>('');

  const token = localStorage.getItem('token');

  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const fetchSubjects = async () => {
    try {
      const res = await axios.get<Subject[]>(`${API_BASE}/subjects`, config);
      setSubjects(res.data);
    } catch (err) {
      console.error('Error fetching subjects', err);
    }
  };

  const fetchAssigned = async () => {
    try {
      const res = await axios.get<AssignedSubject[]>(`${API_BASE}/teacher-subjects/me`, config);
      setAssignedSubjects(res.data);
    } catch (err) {
      console.error('Error fetching assigned subjects', err);
    }
  };

  useEffect(() => {
    fetchSubjects();
    fetchAssigned();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCheckboxChange = (subjectId: number) => {
    setSelectedSubjects((prev) =>
      prev.includes(subjectId)
        ? prev.filter((id) => id !== subjectId)
        : [...prev, subjectId]
    );
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (selectedSubjects.length === 0) return;

    setLoading(true);
    setMessage('');
    try {
      await Promise.all(
        selectedSubjects.map((subjectId) =>
          axios.post(`${API_BASE}/teacher-subjects`, { subject_id: subjectId }, config)
        )
      );
      await fetchAssigned();
      setSelectedSubjects([]);
      setMessage('Subjects assigned successfully.');
    } catch (err) {
      console.error('Error assigning subjects', err);
      setMessage('Failed to assign subjects.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (subjectId: number) => {
    if (!window.confirm('Are you sure you want to unassign this subject?')) return;

    try {
      await axios.delete(`${API_BASE}/teacher-subjects/${subjectId}`, config);
      await fetchAssigned();
      setMessage('Subject unassigned successfully.');
    } catch (err) {
      console.error('Error deleting subject', err);
      setMessage('Failed to delete subject.');
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white shadow-xl rounded-xl mt-10 relative">
      <h2 className="text-2xl font-bold mb-6">Manage Your Subjects</h2>

      {message && (
        <div className="absolute top-2 right-4 bg-green-100 text-green-800 px-4 py-2 rounded shadow text-sm">
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mb-8">
        <h3 className="text-lg font-semibold mb-3">Select Subjects:</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-60 overflow-y-auto border p-4 rounded bg-gray-50">
          {subjects.map((subject) => (
            <label key={subject.subject_id} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={selectedSubjects.includes(subject.subject_id)}
                onChange={() => handleCheckboxChange(subject.subject_id)}
              />
              <span>{subject.name}</span>
            </label>
          ))}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="mt-5 bg-blue-600 text-white px-5 py-2 rounded hover:bg-blue-700 transition disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Save Subjects'}
        </button>
      </form>

      <div>
        <h3 className="text-lg font-semibold mb-3">Already Assigned:</h3>
        <div className="space-y-3 max-h-64 overflow-y-auto border p-4 rounded bg-gray-50">
          {assignedSubjects.length === 0 ? (
            <p className="text-gray-500 text-sm">No subjects assigned yet.</p>
          ) : (
            assignedSubjects.map((s) => (
              <div
                key={s.subject_id}
                className="flex justify-between items-center bg-white border rounded px-4 py-2 shadow-sm"
              >
                <span>{s.subject_name}</span>
                <button
                  onClick={() => handleDelete(s.subject_id)}
                  className="text-red-600 hover:underline text-sm"
                >
                  Remove
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
