import { http } from '@/utils/http'
import type { MenuItem, StatusType } from '@/types/api'

export interface MenuPayload {
  parentId: number
  type: MenuItem['type']
  name: string
  path: string
  perms: string
  icon: string
  order: number
  status: StatusType
  visible: StatusType
}

export const menuApi = {
  tree: () => http.get<MenuItem[]>('/menu/tree'),
  create: (data: MenuPayload) => http.post<MenuItem>('/menu', data),
  update: (id: number, data: Partial<MenuPayload>) => http.put<null>(`/menu/${id}`, data),
  remove: (id: number) => http.delete<null>(`/menu/${id}`),
}
