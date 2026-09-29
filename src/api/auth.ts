import { http } from '@/utils/http'
import type { LoginParams, LoginResult, UserInfo } from '@/types/api'

export const authApi = {
  login: (data: LoginParams) => http.post<LoginResult>('/auth/login', data),
  logout: () => http.post<null>('/auth/logout'),
  getInfo: () => http.get<UserInfo>('/auth/info'),
}
