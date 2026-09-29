import { defineComponent, h, type Component } from 'vue'
import { cn } from './cn'

/**
 * 快速生成「带预设样式的包装组件」
 * 用于 shadcn/ui 风格的基础 UI 组件：透传 attrs/slots，并把外部 class 合并到预设样式之后
 */
export function styled(tag: Component | string, base: string, name: string) {
  return defineComponent({
    name,
    inheritAttrs: false,
    setup(_, { attrs, slots }) {
      return () =>
        h(
          tag,
          {
            ...attrs,
            class: cn(base, attrs.class as never),
          },
          slots,
        )
    },
  })
}
