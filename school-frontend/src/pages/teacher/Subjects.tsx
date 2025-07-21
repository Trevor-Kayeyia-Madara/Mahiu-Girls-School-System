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
  const [assignedSubjects, setAssignedSubjects] = useState<AssignedSubject[]>([]);
  const [selectedSubjects, setSelectedSubjects] = useState<number[]>([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem('token');
  const config = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => {
    fetchSubjects();
    fetchAssigned();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
      setMessage('✅ Subjects assigned successfully.');
    } catch (err) {
      console.error('Error assigning subjects', err);
      setMessage('❌ Failed to assign subjects.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (subjectId: number) => {
    if (!confirm('Are you sure you want to unassign this subject?')) return;

    try {
      await axios.delete(`${API_BASE}/teacher-subjects/${subjectId}`, config);
      await fetchAssigned();
      setMessage('🗑️ Subject unassigned successfully.');
    } catch (err) {
      console.error('Error deleting subject', err);
      setMessage('❌ Failed to delete subject.');
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-6 py-8 bg-white shadow-md rounded-xl">
      <h1 className="text-2xl font-bold text-blue-800 mb-4">🧑‍🏫 Manage Your Subjects</h1>

      {message && <div className="mb-4 text-sm text-green-700">{message}</div>}

      <form onSubmit={handleSubmit}>
        <fieldset className="space-y-3 mb-4">
          <legend className="text-lg font-semibold text-gray-700 mb-2">
            Select Subjects to Teach
          </legend>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {subjects.map((subject) => (
              <label key={subject.subject_id} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={selectedSubjects.includes(subject.subject_id)}
                  onChange={() => handleCheckboxChange(subject.subject_id)}
                  className="form-checkbox text-blue-600"
                />
                <span className="text-gray-700">{subject.name}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <button
          type="submit"
          disabled={loading}
          className={`mt-2 px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 transition ${
            loading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {loading ? 'Saving...' : '💾 Save Subjects'}
        </button>
      </form>

      {/* Already Assigned */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">📋 Assigned Subjects</h2>
        {assignedSubjects.length === 0 ? (
          <p className="text-sm text-gray-500">You have not been assigned to any subjects yet.</p>
        ) : (
          <ul className="space-y-2">
            {assignedSubjects.map((subject) => (
              <li
                key={subject.subject_id}
                className="flex justify-between items-center bg-gray-100 p-2 rounded"
              >
                <span className="text-gray-800">{subject.subject_name}</span>
                <button
                  onClick={() => handleDelete(subject.subject_id)}
                  className="text-sm text-red-600 hover:underline"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
