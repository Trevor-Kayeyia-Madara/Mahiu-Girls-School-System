/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import axios from 'axios';

interface Props {
  onClose: () => void;
  onSaved: () => void;
  student?: any; // used in edit mode
}

export default function StudentForm({ onClose, onSaved, student }: Props) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [admissionNumber, setAdmissionNumber] = useState('');
  const [gender, setGender] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [guardianName, setGuardianName] = useState('');
  const [guardianPhone, setGuardianPhone] = useState('');
  const [address, setAddress] = useState('');
  const [classId, setClassId] = useState<number | ''>('');
  const [classOptions, setClassOptions] = useState([]);
  const [studentCount, setStudentCount] = useState(0); // New state to keep track of student count

  useEffect(() => {
    // Fetch class options
    axios.get('http://localhost:5001/api/v1/classrooms')
      .then(res => setClassOptions(res.data))
      .catch(err => console.error('Error fetching class options:', err));

    // Set admission number based on student count
    if (!student) {
      // Generate admission number based on current student count
      const nextAdmissionNumber = String(studentCount + 1).padStart(3, '0');
      setAdmissionNumber(nextAdmissionNumber);
    } else {
      // Populate form fields if in edit mode
      setFirstName(student?.first_name || '');
      setLastName(student?.last_name || '');
      setAdmissionNumber(student?.admission_number || ''); // This will be read-only
      setGender(student?.gender || '');
      setDateOfBirth(student?.date_of_birth || '');
      setGuardianName(student?.guardian_name || '');
      setGuardianPhone(student?.guardian_phone || '');
      setAddress(student?.address || '');
      setClassId(student?.class_id || '');
    }
  }, [student, studentCount]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      first_name: firstName,
      last_name: lastName,
      admission_number: admissionNumber,
      gender,
      date_of_birth: dateOfBirth,
      guardian_name: guardianName,
      guardian_phone: guardianPhone,
      address,
      class_id: parseInt(classId as string),
    };

    try {
      if (student) {
        const studentIdToUpdate = student?.student_id || student?.user?.student_id || student?.id;
        console.log('Updating student with ID:', studentIdToUpdate);
        await axios.put(`http://localhost:5001/api/v1/students/${studentIdToUpdate}`, payload);
      } else {
        console.log('Creating new student');
        await axios.post('http://localhost:5001/api/v1/students', payload);
        setStudentCount(prevCount => prevCount + 1); // Increment student count after adding a new student
      }

      onSaved();
      onClose();
    } catch (err) {
      console.error('Error saving student:', err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded shadow w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">{student ? 'Edit Student' : 'Add Student'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            value={firstName}
            onChange={e => setFirstName(e.target.value)}
            className="w-full border p-2 rounded"
            placeholder="First Name"
            required
          />
          <input
            value={lastName}
            onChange={e => setLastName(e.target.value)}
            className="w-full border p-2 rounded"
            placeholder="Last Name"
            required
          />
          <input
            value={admissionNumber}
            className="w-full border p-2 rounded"
            placeholder="Admission Number"
            readOnly // Admission number is now read-only
            required
          />
          <input
            value={gender}
            onChange={e => setGender(e.target.value)}
            className="w-full border p-2 rounded"
            placeholder="Gender"
            required
          />
          <input
            value={dateOfBirth}
            onChange={e => setDateOfBirth(e.target.value)}
            type="date"
            className="w-full border p-2 rounded"
            placeholder="Date of Birth"
            required
          />
          <input
            value={guardianName}
            onChange={e => setGuardianName(e.target.value)}
            className="w-full border p-2 rounded"
            placeholder="Guardian Name"
          />
          <input
            value={guardianPhone}
            onChange={e => setGuardianPhone(e.target.value)}
            className="w-full border p-2 rounded"
            placeholder="Guardian Phone"
          />
          <input
            value={address}
            onChange={e => setAddress(e.target.value)}
            className="w-full border p-2 rounded"
            placeholder="Address"
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
  );
}
