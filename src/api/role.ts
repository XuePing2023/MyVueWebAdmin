import { http } from '@/utils/http'
import type { RoleItem, StatusType } from '@/types/api'

export interface RolePayload {
  name: string
  code: string
  description: string
  status: StatusType
}

export const roleApi = {
  list: () => http.get<RoleItem[]>('/role/list'),
  create: (data: RolePayload) => http.post<RoleItem>('/role', data),
  update: (id: number, data: Partial<RolePayload>) => http.put<null>(`/role/${id}`, data),
  remove: (id: number) => http.delete<null>(`/role/${id}`),
  assignMenus: (id: number, menuIds: number[]) => http.put<null>(`/role/${id}/menus`, { menuIds }),
}
