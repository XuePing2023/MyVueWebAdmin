import { reactive } from 'vue'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface ToastItem {
  id: number
  type: ToastType
  message: string
}

export const toasts = reactive<ToastItem[]>([])

let uid = 0

function push(type: ToastType, message: string, duration = 3000) {
  const item: ToastItem = { id: ++uid, type, message }
  toasts.push(item)
  if (toasts.length > 5) toasts.shift()
  window.setTimeout(() => dismiss(item.id), duration)
}

export function dismiss(id: number) {
  const index = toasts.findIndex(t => t.id === id)
  if (index > -1) toasts.splice(index, 1)
}

export const toast = {
  success: (message: string) => push('success', message),
  error: (message: string) => push('error', message, 4000),
  warning: (message: string) => push('warning', message, 4000),
  info: (message: string) => push('info', message),
}
