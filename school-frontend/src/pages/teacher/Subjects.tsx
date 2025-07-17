import React, { useEffect, useState, type FormEvent } from 'react';
import axios from 'axios';

const API_BASE = 'http://localhost:5001/api/v1';

interface Subject {
  subject_id: number;
  name: string;
}

interface AssignedSubject {
  subject_id: number;
  name: string;
}

interface Props {
  token: string;
}

const TeacherSubjects: React.FC<Props> = ({ token }) => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubjects, setSelectedSubjects] = useState<number[]>([]);
  const [assignedSubjects, setAssignedSubjects] = useState<AssignedSubject[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string>('');

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const headers = {
    Authorization: `Bearer ${token}`,
  };

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const res = await axios.get<Subject[]>(`${API_BASE}/subjects`, { headers });
        setSubjects(res.data);
      } catch (err) {
        console.error('Error fetching subjects', err);
      }
    };

    const fetchAssigned = async () => {
      try {
        const res = await axios.get<AssignedSubject[]>(`${API_BASE}/teacher-subjects/me`, { headers });
        setAssignedSubjects(res.data);
      } catch (err) {
        console.error('Error fetching assigned subjects', err);
      }
    };

    fetchSubjects();
    fetchAssigned();
  }, [headers, token]);

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
          axios.post(
            `${API_BASE}/teacher-subjects`,
            { subject_id: subjectId },
            { headers }
          )
        )
      );

      const updated = await axios.get<AssignedSubject[]>(`${API_BASE}/teacher-subjects/me`, { headers });
      setAssignedSubjects(updated.data);
      setSelectedSubjects([]);
      setMessage('Subjects assigned successfully.');
    } catch (err) {
      console.error('Error assigning subjects', err);
      setMessage('Failed to assign subjects.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-white shadow rounded-xl mt-10">
      <h2 className="text-2xl font-bold mb-4">Assign Subjects You Teach</h2>

      {message && <div className="text-sm text-green-600 mb-4">{message}</div>}

      <form onSubmit={handleSubmit}>
        <div className="space-y-2">
          {subjects.map((subject) => (
            <label key={subject.subject_id} className="block">
              <input
                type="checkbox"
                checked={selectedSubjects.includes(subject.subject_id)}
                onChange={() => handleCheckboxChange(subject.subject_id)}
                className="mr-2"
              />
              {subject.name}
            </label>
          ))}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          {loading ? 'Saving...' : 'Save Subjects'}
        </button>
      </form>

      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-2">Already Assigned:</h3>
        <ul className="list-disc pl-6">
          {assignedSubjects.map((s) => (
            <li key={s.subject_id}>{s.name}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default TeacherSubjects;
