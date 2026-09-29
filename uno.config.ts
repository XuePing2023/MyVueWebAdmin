import {
  defineConfig,
  presetWind3,
  transformerVariantGroup,
} from 'unocss'

/**
 * UnoCSS 配置
 * 使用 presetWind3（Tailwind CSS 兼容预设）+ shadcn/ui 主题色体系
 * 颜色全部映射到 CSS 变量，配合 src/styles/index.css 中的亮/暗两套变量实现主题切换
 */
export default defineConfig({
  presets: [
    presetWind3({
      // class 策略暗黑模式：在 <html> 上切换 .dark 类
      dark: 'class',
    }),
  ],
  transformers: [transformerVariantGroup()],
  theme: {
    colors: {
      border: 'hsl(var(--border))',
      input: 'hsl(var(--input))',
      ring: 'hsl(var(--ring))',
      background: 'hsl(var(--background))',
      foreground: 'hsl(var(--foreground))',
      primary: {
        DEFAULT: 'hsl(var(--primary))',
        hover: 'hsl(var(--primary-hover))',
        foreground: 'hsl(var(--primary-foreground))',
      },
      secondary: {
        DEFAULT: 'hsl(var(--secondary))',
        hover: 'hsl(var(--secondary-hover))',
        foreground: 'hsl(var(--secondary-foreground))',
      },
      destructive: {
        DEFAULT: 'hsl(var(--destructive))',
        hover: 'hsl(var(--destructive-hover))',
        foreground: 'hsl(var(--destructive-foreground))',
      },
      muted: {
        DEFAULT: 'hsl(var(--muted))',
        foreground: 'hsl(var(--muted-foreground))',
      },
      accent: {
        DEFAULT: 'hsl(var(--accent))',
        foreground: 'hsl(var(--accent-foreground))',
      },
      popover: {
        DEFAULT: 'hsl(var(--popover))',
        foreground: 'hsl(var(--popover-foreground))',
      },
      card: {
        DEFAULT: 'hsl(var(--card))',
        foreground: 'hsl(var(--card-foreground))',
      },
      success: {
        DEFAULT: 'hsl(var(--success))',
        foreground: 'hsl(var(--success-foreground))',
      },
      warning: {
        DEFAULT: 'hsl(var(--warning))',
        foreground: 'hsl(var(--warning-foreground))',
      },
    },
    borderRadius: {
      lg: 'var(--radius)',
      md: 'calc(var(--radius) - 2px)',
      sm: 'calc(var(--radius) - 4px)',
    },
  },
  shortcuts: {
    'flex-center': 'flex items-center justify-center',
    'flex-between': 'flex items-center justify-between',
    'text-ellipsis': 'overflow-hidden text-ellipsis whitespace-nowrap',
  },
})
