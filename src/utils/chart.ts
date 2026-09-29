/** ECharts 图表辅助：读取 CSS 变量的实际颜色值（canvas 无法解析 var()） */
export function cssVar(name: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim()
}

/** 读取主题色系并拼成 hsl() 颜色 */
export function hslVar(name: string): string {
  const v = cssVar(name)
  return v ? `hsl(${v})` : '#888'
}

/** 图表统一配色 */
export const chartPalette = ['#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#14b8a6', '#f97316', '#06b6d4']
