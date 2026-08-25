import apiClient from './client'
import type { Registration } from '@/types'

export async function registerForEvent(userId: number, eventId: number): Promise<Registration> {
  const { data } = await apiClient.post<Registration>('/registrations', { userId, eventId })
  return data
}

export async function getUserRegistrations(userId: number): Promise<Registration[]> {
  const { data } = await apiClient.get<Registration[]>(`/registrations/user/${userId}`)
  return data
}

export async function cancelRegistration(registrationId: number): Promise<void> {
  await apiClient.delete(`/registrations/${registrationId}`)
}
