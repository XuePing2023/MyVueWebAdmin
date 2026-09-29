import { http } from '@/utils/http'
import type { LoginLogItem, UserInfo } from '@/types/api'

export interface ProfilePayload {
  nickname: string
  email: string
  phone: string
  bio: string
}

export interface PasswordPayload {
  oldPassword: string
  newPassword: string
}

export const profileApi = {
  update: (data: ProfilePayload) => http.put<UserInfo>('/profile', data),
  updatePassword: (data: PasswordPayload) => http.put<null>('/profile/password', data),
  logs: () => http.get<LoginLogItem[]>('/profile/logs'),
}
