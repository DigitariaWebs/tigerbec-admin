"use client"

import { useState, useCallback, useEffect } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { eventsApi, type CreateEventDto, type UpdateEventDto } from "@/lib/api/events"
import { type CalendarEvent } from "./types"
import { toast } from "sonner"

export interface UseCalendarState {
  selectedDate: Date
  showEventForm: boolean
  editingEvent: CalendarEvent | null
  defaultEventDate?: Date
  showCalendarSheet: boolean
  events: CalendarEvent[]
  visibleCalendars: Set<string>
  filteredEvents: CalendarEvent[]
}

export interface UseCalendarActions {
  setSelectedDate: (date: Date) => void
  setShowEventForm: (show: boolean) => void
  setEditingEvent: (event: CalendarEvent | null) => void
  setShowCalendarSheet: (show: boolean) => void
  handleDateSelect: (date: Date) => void
  handleNewEvent: (date?: Date) => void
  handleNewCalendar: () => void
  handleSaveEvent: (eventData: Partial<CalendarEvent>) => void
  handleDeleteEvent: (eventId: number | string) => void
  handleEditEvent: (event: CalendarEvent) => void
  handleCalendarToggle: (calendarId: string, visible: boolean) => void
}

export interface UseCalendarReturn extends UseCalendarState, UseCalendarActions { }

// Helper function to convert duration string to minutes
function parseDuration(duration: string): number {
  const match = duration.toLowerCase().match(/(\d+\.?\d*)\s*(min|hour|hr|h)/)
  if (!match) return 60 // default 1 hour

  const value = parseFloat(match[1])
  const unit = match[2]

  if (unit === 'min') return value
  if (unit === 'hour' || unit === 'hr' || unit === 'h') return value * 60

  return 60
}

// Helper function to convert time string to ISO date
function createEventDate(date: Date, timeStr: string): string {
  const timeParts = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i)
  if (!timeParts) {
    return date.toISOString()
  }

  let hours = parseInt(timeParts[1])
  const minutes = parseInt(timeParts[2])
  const period = timeParts[3].toUpperCase()

  if (period === 'PM' && hours !== 12) hours += 12
  if (period === 'AM' && hours === 12) hours = 0

  const eventDate = new Date(date)
  eventDate.setHours(hours, minutes, 0, 0)

  return eventDate.toISOString()
}

// Map event types to calendar IDs (now they match directly)
const eventTypeToCalendarId: Record<string, string> = {
  'work': 'work',
  'personal': 'personal',
  'family': 'family',
  'holiday': 'holidays',
  'birthday': 'birthdays',
  'travel': 'travel',
  'reminder': 'reminders',
  'deadline': 'deadlines',
}

export function useCalendar(initialEvents: CalendarEvent[] = []): UseCalendarReturn {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [showEventForm, setShowEventForm] = useState(false)
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null)
  const [defaultEventDate, setDefaultEventDate] = useState<Date | undefined>(undefined)
  const [showCalendarSheet, setShowCalendarSheet] = useState(false)
  const [events, setEvents] = useState<CalendarEvent[]>(initialEvents)

  // Track visible calendars (all visible by default)
  const [visibleCalendars, setVisibleCalendars] = useState<Set<string>>(
    new Set(['personal', 'work', 'family', 'holidays', 'birthdays', 'travel', 'reminders', 'deadlines'])
  )

  // Update events when initialEvents changes
  useEffect(() => {
    setEvents(initialEvents)
  }, [initialEvents])

  // Filter events based on visible calendars
  const filteredEvents = events.filter(event => {
    const calendarId = eventTypeToCalendarId[event.type] || 'personal'
    const shouldShow = visibleCalendars.has(calendarId)
    // console.log(`Event "${event.title}" (type: ${event.type}) → calendar: ${calendarId} → visible: ${shouldShow}`)
    return shouldShow
  })

  const queryClient = useQueryClient()

  // Create event mutation
  const createEventMutation = useMutation({
    mutationFn: (data: CreateEventDto) => eventsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] })
      toast.success('Event created successfully')
      setShowEventForm(false)
      setEditingEvent(null)
    },
    onError: (error: Error) => {
      toast.error(`Failed to create event: ${error.message}`)
    },
  })

  // Update event mutation
  const updateEventMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateEventDto }) =>
      eventsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] })
      toast.success('Event updated successfully')
      setShowEventForm(false)
      setEditingEvent(null)
    },
    onError: (error: Error) => {
      toast.error(`Failed to update event: ${error.message}`)
    },
  })

  // Delete event mutation
  const deleteEventMutation = useMutation({
    mutationFn: (id: string) => eventsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] })
      toast.success('Event deleted successfully')
      setShowEventForm(false)
      setEditingEvent(null)
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete event: ${error.message}`)
    },
  })

  const handleDateSelect = useCallback((date: Date) => {
    setSelectedDate(date)
    // Auto-close mobile sheet when date is selected
    setShowCalendarSheet(false)
  }, [])

  const handleNewEvent = useCallback((date?: Date) => {
    setEditingEvent(null)
    setDefaultEventDate(date)
    setShowEventForm(true)
  }, [])

  const handleNewCalendar = useCallback(() => {
    console.log("Creating new calendar")
    // In a real app, this would open a new calendar form
  }, [])

  const handleSaveEvent = useCallback((eventData: Partial<CalendarEvent>) => {
    // Transform the data to match backend API
    const duration = parseDuration(eventData.duration || '1 hour')
    const event_date = createEventDate(eventData.date || new Date(), eventData.time || '9:00 AM')

    const apiData = {
      title: eventData.title || '',
      description: eventData.description,
      event_date,
      duration,
      type: eventData.type,
      location: eventData.location,
      attendees: eventData.attendees || [],
      color: eventData.color,
    }

    if (editingEvent?.id) {
      // Update existing event
      updateEventMutation.mutate({
        id: String(editingEvent.id),
        data: apiData
      })
    } else {
      // Create new event
      createEventMutation.mutate(apiData)
    }
  }, [editingEvent, createEventMutation, updateEventMutation])

  const handleDeleteEvent = useCallback((eventId: number | string) => {
    deleteEventMutation.mutate(String(eventId))
  }, [deleteEventMutation])

  const handleEditEvent = useCallback((event: CalendarEvent) => {
    setEditingEvent(event)
    setShowEventForm(true)
  }, [])

  const handleCalendarToggle = useCallback((calendarId: string, visible: boolean) => {
    setVisibleCalendars(prev => {
      const newSet = new Set(prev)
      if (visible) {
        newSet.add(calendarId)
      } else {
        newSet.delete(calendarId)
      }
      return newSet
    })
  }, [])

  return {
    // State
    selectedDate,
    showEventForm,
    editingEvent,
    defaultEventDate,
    showCalendarSheet,
    events,
    visibleCalendars,
    filteredEvents,
    // Actions
    setSelectedDate,
    setShowEventForm,
    setEditingEvent,
    setShowCalendarSheet,
    handleDateSelect,
    handleNewEvent,
    handleNewCalendar,
    handleSaveEvent,
    handleDeleteEvent,
    handleEditEvent,
    handleCalendarToggle,
  }
}
