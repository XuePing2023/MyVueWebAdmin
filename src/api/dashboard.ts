import { http } from '@/utils/http'
import type { DashboardData } from '@/types/api'

export const dashboardApi = {
  getData: () => http.get<DashboardData>('/dashboard/all'),
}
