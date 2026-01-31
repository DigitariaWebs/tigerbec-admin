"use client"

import { useQuery } from "@tanstack/react-query"
import { eventsApi, type Event } from "@/lib/api/events"
import { Calendar } from "./components/calendar"
import { type CalendarEvent } from "./types"

// Helper function to convert API Event to CalendarEvent
function convertToCalendarEvent(event: Event): CalendarEvent {
  const eventDate = new Date(event.event_date)
  
  // Format time to "9:00 AM" format
  const hours = eventDate.getHours()
  const minutes = eventDate.getMinutes()
  const period = hours >= 12 ? 'PM' : 'AM'
  const displayHours = hours % 12 || 12
  const time = `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`
  
  // Format duration to readable string
  const durationInMinutes = event.duration
  let duration: string
  if (durationInMinutes >= 60) {
    const hours = durationInMinutes / 60
    duration = hours === 1 ? '1 hour' : `${hours} hours`
  } else {
    duration = `${durationInMinutes} min`
  }
  
  return {
    id: event.id, // Keep the UUID string
    title: event.title,
    date: eventDate,
    time,
    duration,
    type: event.type,
    attendees: event.attendees || [],
    location: event.location || '',
    color: event.color || '#3b82f6',
    description: event.description,
  }
}

// Helper to count events per day
function getEventDates(events: CalendarEvent[]): Array<{ date: Date; count: number }> {
  const dateMap = new Map<string, number>()
  
  events.forEach(event => {
    const dateKey = event.date.toDateString()
    dateMap.set(dateKey, (dateMap.get(dateKey) || 0) + 1)
  })
  
  return Array.from(dateMap.entries()).map(([dateStr, count]) => ({
    date: new Date(dateStr),
    count,
  }))
}

export default function CalendarPage() {
  // Fetch events from API
  const { data: apiEvents = [], isLoading } = useQuery<Event[]>({
    queryKey: ['events'],
    queryFn: () => eventsApi.getAll(),
  })
  
  // Convert API events to CalendarEvent format
  const events = apiEvents.map(convertToCalendarEvent)
  const eventDates = getEventDates(events)
  
  if (isLoading) {
    return (
      <div className="px-4 lg:px-6 flex items-center justify-center min-h-[600px]">
        <div className="text-muted-foreground">Loading events...</div>
      </div>
    )
  }

  return (
    <div className="px-4 lg:px-6">
      <Calendar events={events} eventDates={eventDates} />
    </div>
  )
}
