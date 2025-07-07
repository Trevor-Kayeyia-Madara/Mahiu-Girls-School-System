export interface Teacher {
  staff_id: number
  user: { name: string }
}

export interface Subject {
  subject_id: number
  name: string
  group: string
}

export interface Classroom {
  class_id: number
  class_name: string
}

export interface Assignment {
  class_id: number
  subject_id: number
  teacher_id: number
}
