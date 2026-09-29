import {
  DropdownMenuCheckboxItem as CheckboxItem,
  DropdownMenuContent as Content,
  DropdownMenuGroup as Group,
  DropdownMenuItem as Item,
  DropdownMenuLabel as Label,
  DropdownMenuPortal as Portal,
  DropdownMenuRadioGroup as RadioGroup,
  DropdownMenuRoot as Root,
  DropdownMenuSeparator as Separator,
  DropdownMenuTrigger as Trigger,
} from 'reka-ui'

import { styled } from '@/utils/component'

export { default as DropdownMenuCheckboxItem } from './DropdownMenuCheckboxItem.vue'

export const DropdownMenu = Root
export const DropdownMenuTrigger = Trigger
export const DropdownMenuGroup = Group
export const DropdownMenuPortal = Portal
export const DropdownMenuRadioGroup = RadioGroup

export const DropdownMenuContent = styled(
  Content,
  'z-50 min-w-32 overflow-hidden rounded-md border border-border bg-popover p-1 text-popover-foreground shadow-md',
  'DropdownMenuContent',
)

export const DropdownMenuItem = styled(
  Item,
  'relative flex cursor-pointer select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:h-4 [&_svg]:w-4 [&_svg]:shrink-0',
  'DropdownMenuItem',
)

export const DropdownMenuLabel = styled(
  Label,
  'px-2 py-1.5 text-sm font-semibold',
  'DropdownMenuLabel',
)

export const DropdownMenuSeparator = styled(Separator, '-mx-1 my-1 h-px bg-border', 'DropdownMenuSeparator')

export const DropdownMenuShortcut = styled(
  'span',
  'ml-auto text-xs tracking-widest text-muted-foreground',
  'DropdownMenuShortcut',
)
