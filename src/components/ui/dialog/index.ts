import { DialogClose as Close, DialogDescription as Description, DialogRoot, DialogTitle as Title, DialogTrigger as Trigger } from 'reka-ui'

import { styled } from '@/utils/component'

export { default as DialogContent } from './DialogContent.vue'

export const Dialog = DialogRoot

export const DialogTrigger = Trigger

export const DialogClose = Close

export const DialogHeader = styled('div', 'flex flex-col gap-1.5 text-left', 'DialogHeader')

export const DialogFooter = styled(
  'div',
  'flex flex-col-reverse gap-2 sm:flex-row sm:justify-end',
  'DialogFooter',
)

export const DialogTitle = styled(
  Title,
  'text-lg font-semibold leading-none tracking-tight',
  'DialogTitle',
)

export const DialogDescription = styled(
  Description,
  'text-sm text-muted-foreground',
  'DialogDescription',
)
