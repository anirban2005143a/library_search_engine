export type ViewState = "idle" | "open" | "uploading" | "file_upload" | "manual_upload"
export type Role = "READER" | "ADMIN" | "ROOT_ADMIN"

export interface UserEntry {
  id: string
  firstName: string
  lastName: string
  email: string
  password: string
  role: Role
  isQueued: boolean
  isEditing: boolean
}
