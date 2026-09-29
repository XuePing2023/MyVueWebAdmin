import { defineComponent, h } from 'vue'

import { cn } from '@/utils/cn'
import { styled } from '@/utils/component'

export const Table = defineComponent({
  name: 'Table',
  inheritAttrs: false,
  setup(_, { attrs, slots }) {
    return () =>
      h('div', { ...attrs, class: cn('relative w-full overflow-x-auto', attrs.class as never) }, [
        h('table', { class: 'w-full caption-bottom text-sm' }, slots.default?.()),
      ])
  },
})

export const TableHeader = styled('thead', '[&_tr]:border-b border-border', 'TableHeader')

export const TableBody = styled('tbody', '[&_tr:last-child]:border-0', 'TableBody')

export const TableRow = styled(
  'tr',
  'border-b border-border transition-colors hover:bg-accent data-[state=selected]:bg-accent',
  'TableRow',
)

export const TableHead = styled(
  'th',
  'h-11 px-3 text-left align-middle text-sm font-medium text-muted-foreground',
  'TableHead',
)

export const TableCell = styled('td', 'p-3 align-middle text-sm', 'TableCell')

export const TableCaption = styled('caption', 'mt-4 text-sm text-muted-foreground', 'TableCaption')
