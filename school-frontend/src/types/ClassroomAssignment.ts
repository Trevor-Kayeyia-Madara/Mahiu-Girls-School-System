export interface Teacher {
  staff_id: number
  user: { name: string }
    role: string  // ✅ Add this line
}

export interface Subject {
  subject_id: number
  name: string
  group: string
}

export interface Classroom {
  class_id: number
  class_name: string
  class_teacher_id?: number
  class_teacher?: string
}

export interface TeacherSubject {
  id?: number
  teacher_id: number
  class_id: number
  subject_id: number
}
