export interface CalendarEvent {
  id: number | string
  title: string
  date: Date
  time: string
  duration: string
  type: "work" | "personal" | "family" | "holiday" | "birthday" | "travel" | "reminder" | "deadline"
  attendees: string[]
  location: string
  color: string
  description?: string
}

export interface Calendar {
  id: string
  name: string
  color: string
  visible: boolean
  type: "personal" | "work" | "shared"
}
