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
}

interface ClassItem {
  class_id: number;
  class_name: string;
  form_level: string;
}

export default function AdminStudentSubjectSelection() {
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedForm, setSelectedForm] = useState<string>("Form 3");
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null);
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);
  const [selectedSubjectIds, setSelectedSubjectIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
    const token = localStorage.getItem('token')
  const headers = { Authorization: `Bearer ${token}` }

  const groupColors: Record<string, string> = {
    Science: "bg-blue-100 border-blue-500",
    Language: "bg-green-100 border-green-500",
    Humanities: "bg-yellow-100 border-yellow-500",
    "Applied Sciences": "bg-purple-100 border-purple-500",
    Others: "bg-gray-100 border-gray-500",
  };

  useEffect(() => {
    fetchSubjects();
  }, []);

  useEffect(() => {
    if (selectedForm) {
      const normalizedForm = selectedForm.replace("Form ", "");
      fetchFilteredClasses(normalizedForm);
      setSelectedClassId(null);
      setStudents([]);
    }
  }, [selectedForm]);

  useEffect(() => {
    if (selectedClassId !== null) {
      fetchStudentsByClass(selectedClassId);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedClassId]);

  const fetchSubjects = async () => {
    try {
      const res = await axios.get("http://localhost:5001/api/v1/subjects",);
      setSubjects(res.data);
    } catch (err) {
      console.error("Error fetching subjects:", err);
    }
  };

  const fetchFilteredClasses = async (formLevel: string) => {
    try {
      const res = await axios.get("http://localhost:5001/api/v1/classrooms/filter", {
        params: { form_level: formLevel },
      });
      setClasses(res.data);
    } catch (err) {
      console.error("Error fetching filtered classes:", err);
    }
  };

  const fetchStudentsByClass = async (classId: number) => {
    setLoading(true);
    try {
      const res = await axios.get(`http://localhost:5001/api/v1/students/class/${classId}`,{ headers });
      setStudents(res.data);
    } catch (err) {
      console.error("Error fetching students:", err);
    } finally {
      setLoading(false);
      setSelectedStudentId(null);
      setSelectedSubjectIds([]);
    }
  };

  const handleStudentSelect = (id: number) => {
    setSelectedStudentId(id);
    const compulsoryIds = subjects.filter((s) => s.compulsory).map((s) => s.subject_id);
    setSelectedSubjectIds(compulsoryIds);
  };

  const handleCheckboxChange = (subjectId: number) => {
    const isElective = !subjects.find((s) => s.subject_id === subjectId)?.compulsory;
    const electiveSelected = selectedSubjectIds.filter(
      (id) => !subjects.find((s) => s.subject_id === id)?.compulsory
    ).length;

    if (selectedSubjectIds.includes(subjectId)) {
      setSelectedSubjectIds(selectedSubjectIds.filter((id) => id !== subjectId));
    } else if (!isElective || electiveSelected < 4) {
      setSelectedSubjectIds([...selectedSubjectIds, subjectId]);
    }
  };

  const handleSubmit = async () => {
    if (!selectedStudentId) return;

    try {
    await axios.post(
          "http://localhost:5001/api/v1/student-selection/select-subjects",
          {
            student_id: selectedStudentId,
            subject_ids: selectedSubjectIds,
          }
        );
      alert("✅ Subjects saved successfully!");
    } catch (err) {
      console.error("Submission error:", err);
      alert("❌ Failed to save subjects.");
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

  const formLevels = ["Form 3", "Form 4"];

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">📘 Assign Subjects by Form</h1>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <select
          className="border p-2 rounded w-full md:w-1/3"
          value={selectedForm}
          onChange={(e) => setSelectedForm(e.target.value)}
        >
          {formLevels.map((f) => (
            <option key={f} value={f}>
              {f}
            </option>
          ))}
        </select>

        <select
          className="border p-2 rounded w-full md:w-1/3"
          value={selectedClassId ?? ""}
          onChange={(e) => setSelectedClassId(Number(e.target.value))}
        >
          <option value="">-- Select Class --</option>
          {classes.map((cls) => (
            <option key={cls.class_id} value={cls.class_id}>
              {cls.class_name}
            </option>
          ))}
        </select>

        <select
          className="border p-2 rounded w-full md:w-1/3"
          value={selectedStudentId ?? ""}
          onChange={(e) => handleStudentSelect(Number(e.target.value))}
        >
          <option value="">-- Select Student --</option>
          {students.map((s) => (
            <option key={s.student_id} value={s.student_id}>
              {s.first_name} {s.last_name}
            </option>
          ))}
        </select>
      </div>

      {loading && <p className="text-gray-500">🔄 Loading students...</p>}

      {selectedStudentId && (
        <>
          <div className="bg-gray-50 p-4 rounded mb-6">
            <h2 className="text-lg font-semibold mb-3 text-gray-700">✅ Compulsory Subjects</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-gray-400">
              {compulsorySubjects.map((sub) => (
                <label key={sub.subject_id} className="flex items-center gap-2">
                  <input type="checkbox" checked disabled />
                  <span>{sub.name}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="bg-white p-4 rounded shadow mb-6">
            <h2 className="text-lg font-semibold mb-4 text-gray-700">🎯 Elective Subjects (Max 4)</h2>
            {Object.entries(groupedElectives).map(([group, subs]) => (
              <div
                key={group}
                className={`p-4 mb-4 rounded-xl border-l-4 ${groupColors[group] || groupColors["Others"]}`}
              >
                <h3 className="font-semibold text-md mb-2">{group}</h3>
                <div className="grid grid-cols-2 gap-2">
                  {subs.map((sub) => (
                    <label key={sub.subject_id} className="flex items-center gap-2">
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
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded"
          >
            💾 Save Selections
          </button>
        </>
      )}
    </div>
  );
}
