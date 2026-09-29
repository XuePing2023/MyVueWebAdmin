import { DialogClose, DialogDescription as Description, DialogRoot, DialogTitle as Title, DialogTrigger } from 'reka-ui'

import { styled } from '@/utils/component'

export { default as SheetContent } from './SheetContent.vue'

export const Sheet = DialogRoot
export const SheetTrigger = DialogTrigger
export const SheetClose = DialogClose

export const SheetHeader = styled('div', 'flex flex-col gap-1.5', 'SheetHeader')

export const SheetTitle = styled(Title, 'font-semibold text-foreground', 'SheetTitle')

export const SheetDescription = styled(Description, 'text-sm text-muted-foreground', 'SheetDescription')
