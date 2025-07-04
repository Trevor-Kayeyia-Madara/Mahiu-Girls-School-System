import { useEffect, useState } from 'react';
import axios from 'axios';
import StudentForm from '../components/StudentForm';

interface Student {
  id: number;
  first_name: string;
  last_name: string;
  admission_number: string;
  gender: string; // Added gender
  date_of_birth: string; // Added date_of_birth
  guardian_name: string; // Added guardian_name
  guardian_phone: string; // Added guardian_phone
  address: string; // Added address
  class_id: number;
}

interface Classroom {
  class_id: number;
  class_name: string;
}

export default function AdminStudents() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);

  const fetchStudents = async () => {
    try {
      const [studentRes, classRes] = await Promise.all([
        axios.get('http://localhost:5001/api/v1/students'),
        axios.get('http://localhost:5001/api/v1/classrooms')
      ]);
      console.log('Fetched Students:', studentRes.data);
      console.log('Fetched Classrooms:', classRes.data);
      setStudents(studentRes.data);
      setClassrooms(classRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const getClassName = (id: number): string => {
    const cls = classrooms.find(c => c.class_id === id);
    return cls ? cls.class_name : 'Unknown';
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this student?')) return;
    try {
      await axios.delete(`http://localhost:5001/api/v1/students/${id}`);
      fetchStudents();
    } catch (error) {
      console.error('Error deleting student:', error);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">👥 Manage Students</h1>

      <button
        onClick={() => {
          setEditingStudent(null);
          setShowForm(true);
        }}
        className="mb-4 px-4 py-2 bg-blue-600 text-white rounded"
      >
        ➕ Add Student
      </button>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <table className="w-full table-auto bg-white shadow rounded">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="p-2">First Name</th>
              <th className="p-2">Last Name</th>
              <th className="p-2">Admission #</th>
              <th className="p-2">Class</th>
              <th className="p-2">Gender</th> {/* Added Gender Column */}
              <th className="p-2">Date of Birth</th> {/* Added Date of Birth Column */}
              <th className="p-2">Guardian Name</th> {/* Added Guardian Name Column */}
              <th className="p-2">Guardian Phone</th> {/* Added Guardian Phone Column */}
              <th className="p-2">Address</th> {/* Added Address Column */}
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {students.map((s) => (
              <tr key={s.id} className="border-t">
                <td>{s.first_name}</td>
                <td>{s.admission_number}</td>
                <td>{getClassName(s.class_id)}</td>
                <td>{s.gender}</td> {/* Display Gender */}
                <td>{s.date_of_birth}</td> {/* Display Date of Birth */}
                <td>{s.guardian_name}</td> {/* Display Guardian Name */}
                <td>{s.guardian_phone}</td> {/* Display Guardian Phone */}
                <td>{s.address}</td> {/* Display Address */}
                <td className="p-2 space-x-2">
                  <button
                    className="text-blue-600 hover:underline"
                    onClick={() => {
                      setEditingStudent(s);
                      setShowForm(true);
                    }}
                  >
                    Edit
                  </button>
                  <button
                    className="text-red-600 hover:underline"
                    onClick={() => handleDelete(s.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {students.length === 0 && (
              <tr>
                <td colSpan={10} className="p-4 text-center text-gray-500">
                  No students found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}

      {/* Modal Form */}
      {showForm && (
        <StudentForm
          student={editingStudent}
          onClose={() => setShowForm(false)}
          onSaved={fetchStudents}
        />
      )}
    </div>
  );
}
