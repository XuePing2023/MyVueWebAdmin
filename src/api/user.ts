import { http } from '@/utils/http'
import type { PageResult, StatusType, UserItem } from '@/types/api'

export interface UserQuery {
  page: number
  pageSize: number
  keyword?: string
  status?: number | ''
}

export interface UserPayload {
  username: string
  nickname: string
  email: string
  phone: string
  roles: string[]
  status: StatusType
  remark: string
}

export const userApi = {
  page: (params: UserQuery) => http.get<PageResult<UserItem>>('/user/page', params),
  create: (data: UserPayload) => http.post<UserItem>('/user', data),
  update: (id: number, data: Partial<UserPayload>) => http.put<null>(`/user/${id}`, data),
  updateStatus: (id: number, status: StatusType) => http.put<null>(`/user/${id}/status`, { status }),
  remove: (id: number) => http.delete<null>(`/user/${id}`),
  batchRemove: (ids: number[]) => http.post<null>('/user/batch-delete', { ids }),
}
