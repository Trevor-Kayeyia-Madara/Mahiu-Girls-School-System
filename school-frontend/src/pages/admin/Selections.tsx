/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import axios from "axios";

interface Subject {
  subject_id: number;
  name: string;
  group: string;
  compulsory: boolean;
}

interface Student {
  student_id: number;
  first_name: string;
  last_name: string;
  class_id: number;
  class_name?: string;
}

export default function AdminStudentSubjectSelection() {
  const [students, setStudents] = useState<Student[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);
  const [selectedSubjectIds, setSelectedSubjectIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");

  const groupColors: Record<string, string> = {
    "Science": "bg-blue-100 border-blue-500",
    "Language": "bg-green-100 border-green-500",
    "Humanities": "bg-yellow-100 border-yellow-500",
    "Applied Sciences": "bg-purple-100 border-purple-500",
    "Others": "bg-gray-100 border-gray-500",
  };

  const fetchData = async () => {
    setLoading(true);
    const [studentsRes, subjectsRes] = await Promise.all([
      axios.get("http://localhost:5001/api/v1/students", {
        headers: { Authorization: `Bearer ${token}` },
      }),
      axios.get("http://localhost:5001/api/v1/subjects", {
        headers: { Authorization: `Bearer ${token}` },
      }),
    ]);
    setStudents(studentsRes.data);
    setSubjects(subjectsRes.data);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleStudentSelect = (id: number) => {
    setSelectedStudentId(id);
    const compulsory = subjects.filter((s) => s.compulsory).map((s) => s.subject_id);
    setSelectedSubjectIds(compulsory);
  };

  const handleCheckboxChange = (subjectId: number) => {
    if (selectedSubjectIds.includes(subjectId)) {
      setSelectedSubjectIds(selectedSubjectIds.filter((id) => id !== subjectId));
    } else {
      const isElective = subjects.find((s) => s.subject_id === subjectId)?.compulsory === false;
      const electivesSelected = selectedSubjectIds.filter(
        (id) => !subjects.find((s) => s.subject_id === id)?.compulsory
      ).length;

      if (!isElective || electivesSelected < 4) {
        setSelectedSubjectIds([...selectedSubjectIds, subjectId]);
      }
    }
  };

  const handleSubmit = async () => {
    if (!selectedStudentId) return;
    try {
      await axios.post(
        "http://localhost:5001/api/v1/student-selections",
        {
          student_id: selectedStudentId,
          subject_ids: selectedSubjectIds,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      alert("Subjects saved successfully!");
    } catch (err) {
      console.error("Error saving subjects:", err);
      alert("Failed to save subject selections.");
    }
  };

  const compulsorySubjects = subjects.filter((s) => s.compulsory);
  const electiveSubjects = subjects.filter((s) => !s.compulsory);
  const groupedElectives: Record<string, Subject[]> = {};

  electiveSubjects.forEach((s) => {
    const group = s.group || "Others";
    if (!groupedElectives[group]) groupedElectives[group] = [];
    groupedElectives[group].push(s);
  });

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">📘 Assign Student Subjects</h1>

      <select
        className="border p-2 rounded mb-6 w-full"
        onChange={(e) => handleStudentSelect(parseInt(e.target.value))}
        value={selectedStudentId || ""}
      >
        <option value="">-- Select Student --</option>
        {students.map((s) => (
          <option key={s.student_id} value={s.student_id}>
            {s.first_name} {s.last_name}
          </option>
        ))}
      </select>

      {selectedStudentId && (
        <>
          <div className="bg-gray-50 p-4 rounded mb-6">
            <h2 className="text-lg font-semibold mb-2 text-gray-700">✅ Compulsory Subjects</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {compulsorySubjects.map((sub) => (
                <label key={sub.subject_id} className="flex items-center space-x-2 text-gray-400">
                  <input
                    type="checkbox"
                    checked
                    disabled
                  />
                  <span>{sub.name}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="bg-white p-4 rounded shadow mb-6">
            <h2 className="text-lg font-semibold mb-3 text-gray-700">🎯 Elective Subjects (Choose up to 4)</h2>
            {Object.entries(groupedElectives).map(([groupName, subjects]) => (
              <div
                key={groupName}
                className={`p-4 rounded-xl mb-4 border-l-4 ${groupColors[groupName] || groupColors["Others"]}`}
              >
                <h4 className="text-md font-semibold mb-2 text-gray-700">{groupName}</h4>
                <div className="grid grid-cols-2 gap-2">
                  {subjects.map((sub) => (
                    <label key={sub.subject_id} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={selectedSubjectIds.includes(sub.subject_id)}
                        onChange={() => handleCheckboxChange(sub.subject_id)}
                        disabled={
                          !selectedSubjectIds.includes(sub.subject_id) &&
                          selectedSubjectIds.filter(
                            (id) => !compulsorySubjects.find((s) => s.subject_id === id)
                          ).length >= 4
                        }
                      />
                      <span>{sub.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={handleSubmit}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
          >
            💾 Save Subjects
          </button>
        </>
      )}

      {loading && <p className="mt-4">Loading...</p>}
    </div>
  );
}
