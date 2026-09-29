import { ChevronRight } from 'lucide-vue-next'
import { defineComponent, h } from 'vue'

import { cn } from '@/utils/cn'
import { styled } from '@/utils/component'

export const Breadcrumb = styled('nav', 'flex', 'Breadcrumb')

export const BreadcrumbList = styled(
  'ol',
  'flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground',
  'BreadcrumbList',
)

export const BreadcrumbItem = styled('li', 'inline-flex items-center gap-1.5', 'BreadcrumbItem')

export const BreadcrumbLink = styled(
  'a',
  'cursor-pointer transition-colors hover:text-foreground',
  'BreadcrumbLink',
)

export const BreadcrumbPage = styled('span', 'font-normal text-foreground', 'BreadcrumbPage')

export const BreadcrumbSeparator = defineComponent({
  name: 'BreadcrumbSeparator',
  inheritAttrs: false,
  setup(_, { attrs }) {
    return () =>
      h(
        'li',
        {
          role: 'presentation',
          'aria-hidden': 'true',
          ...attrs,
          class: cn('text-muted-foreground [&>svg]:h-3.5 [&>svg]:w-3.5', attrs.class as never),
        },
        h(ChevronRight),
      )
  },
})
