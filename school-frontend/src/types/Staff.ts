// types/Staff.ts
export interface Staff {
  staff_id: number
  employee_id: string
  gender: string
  contact: string
  role: string
  date_of_birth?: string
  qualifications?: string
  user?: {
    user_id: number
    name: string
    email: string
  }
}
