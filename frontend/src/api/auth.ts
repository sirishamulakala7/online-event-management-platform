import apiClient from './client'
import type { AuthResponse } from '@/types'

export interface RegisterParams {
  name: string
  email: string
  password: string
}

export interface LoginParams {
  email: string
  password: string
}

export async function register(params: RegisterParams): Promise<AuthResponse> {
  const { data } = await apiClient.post<AuthResponse>('/auth/register', params)
  return data
}

export async function login(params: LoginParams): Promise<AuthResponse> {
  const { data } = await apiClient.post<AuthResponse>('/auth/login', params)
  return data
}

export async function refresh(refreshToken: string): Promise<AuthResponse> {
  const { data } = await apiClient.post<AuthResponse>('/auth/refresh', { refreshToken })
  return data
}
