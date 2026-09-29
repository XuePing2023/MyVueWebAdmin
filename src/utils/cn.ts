import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/** 合并 className（clsx + tailwind-merge，冲突时后者优先） */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
