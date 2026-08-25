import apiClient from './client'
import type { Event, EventRequest } from '@/types'

export async function getAllEvents(): Promise<Event[]> {
  const { data } = await apiClient.get<Event[]>('/events')
  return data
}

export async function getEventById(id: number): Promise<Event> {
  const { data } = await apiClient.get<Event>(`/events/${id}`)
  return data
}

export async function createEvent(event: EventRequest): Promise<Event> {
  const { data } = await apiClient.post<Event>('/events', event)
  return data
}

export async function updateEvent(id: number, event: EventRequest): Promise<Event> {
  const { data } = await apiClient.put<Event>(`/events/${id}`, event)
  return data
}

export async function deleteEvent(id: number): Promise<void> {
  await apiClient.delete(`/events/${id}`)
}
