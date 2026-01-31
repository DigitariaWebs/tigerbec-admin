/**
 * Events API Client
 * Handles all event-related API operations
 */

import { BaseApiClient } from './base';

export interface Event {
  id: string;
  title: string;
  description?: string;
  event_date: string;
  duration: number;
  type: 'work' | 'personal' | 'family' | 'holiday' | 'birthday' | 'travel' | 'reminder' | 'deadline';
  location?: string;
  attendees: string[];
  color: string;
  created_by?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateEventDto {
  title: string;
  description?: string;
  event_date: string;
  duration?: number;
  type?: 'work' | 'personal' | 'family' | 'holiday' | 'birthday' | 'travel' | 'reminder' | 'deadline';
  location?: string;
  attendees?: string[];
  color?: string;
}

export interface UpdateEventDto {
  title?: string;
  description?: string;
  event_date?: string;
  duration?: number;
  type?: 'work' | 'personal' | 'family' | 'holiday' | 'birthday' | 'travel' | 'reminder' | 'deadline';
  location?: string;
  attendees?: string[];
  color?: string;
}

export interface QueryEventsParams {
  start_date?: string;
  end_date?: string;
  type?: 'work' | 'personal' | 'family' | 'holiday' | 'birthday' | 'travel' | 'reminder' | 'deadline';
}

class EventsApiClient extends BaseApiClient {
  /**
   * Create a new event
   */
  async create(data: CreateEventDto): Promise<Event> {
    return this.request<Event>('/events', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Get all events with optional filters
   */
  async getAll(params?: QueryEventsParams): Promise<Event[]> {
    const queryParams = new URLSearchParams();
    
    if (params?.start_date) queryParams.append('start_date', params.start_date);
    if (params?.end_date) queryParams.append('end_date', params.end_date);
    if (params?.type) queryParams.append('type', params.type);

    const queryString = queryParams.toString();
    const endpoint = queryString ? `/events?${queryString}` : '/events';
    
    return this.request<Event[]>(endpoint);
  }

  /**
   * Get a single event by ID
   */
  async getById(id: string): Promise<Event> {
    return this.request<Event>(`/events/${id}`);
  }

  /**
   * Update an event (PATCH)
   */
  async update(id: string, data: UpdateEventDto): Promise<Event> {
    return this.request<Event>(`/events/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  /**
   * Delete an event
   */
  async delete(id: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/events/${id}`, {
      method: 'DELETE',
    });
  }

  /**
   * Get events by date range
   */
  async getByDateRange(startDate: string, endDate: string): Promise<Event[]> {
    return this.getAll({ start_date: startDate, end_date: endDate });
  }
}

export const eventsApi = new EventsApiClient();
