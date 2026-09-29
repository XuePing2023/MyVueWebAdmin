import { http } from '@/utils/http'
import type { NotificationItem } from '@/types/api'

export const notifyApi = {
  list: () => http.get<NotificationItem[]>('/notify/list'),
  readAll: () => http.post<null>('/notify/read-all'),
}
