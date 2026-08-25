// Core domain types for the Event Management Platform
// Add types here as the API evolves

export interface User {
  id: number
  email: string
  name: string
  role: UserRole
  createdAt: string
}

export enum UserRole {
  ATTENDEE = 'ATTENDEE',
  ORGANIZER = 'ORGANIZER',
  ADMIN = 'ADMIN',
}

export interface Event {
  id: number
  title: string
  description: string
  location: string
  startDate: string
  endDate: string
  maxAttendees: number
  organizerId: number
  organizerName: string
  status: EventStatus
  createdAt: string
  updatedAt: string
}

export interface EventRequest {
  title: string
  description?: string
  location?: string
  startDate: string
  endDate: string
  maxAttendees?: number
  organizerId: number
  status?: EventStatus
}

export enum EventStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED',
}

export interface AuthResponse {
  accessToken: string
  refreshToken: string
  user: User
}

export interface ApiResponse<T> {
  data: T
  message?: string
}
