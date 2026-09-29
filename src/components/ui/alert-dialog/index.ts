import {
  AlertDialogAction as Action,
  AlertDialogCancel as Cancel,
  AlertDialogContent as Content,
  AlertDialogDescription as Description,
  AlertDialogRoot as Root,
  AlertDialogTitle as Title,
  AlertDialogTrigger as Trigger,
} from 'reka-ui'

import { styled } from '@/utils/component'

export { default as AlertDialogContent } from './AlertDialogContent.vue'

export const AlertDialog = Root
export const AlertDialogTrigger = Trigger
export const AlertDialogCancel = styled(
  Cancel,
  'inline-flex h-9 items-center justify-center rounded-md border border-border bg-background px-4 py-2 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50',
  'AlertDialogCancel',
)
export const AlertDialogAction = styled(
  Action,
  'inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary-hover focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50',
  'AlertDialogAction',
)

export const AlertDialogHeader = styled('div', 'flex flex-col gap-2 text-left', 'AlertDialogHeader')
export const AlertDialogFooter = styled(
  'div',
  'flex flex-col-reverse gap-2 sm:flex-row sm:justify-end',
  'AlertDialogFooter',
)
export const AlertDialogTitle = styled(Title, 'text-lg font-semibold', 'AlertDialogTitle')
export const AlertDialogDescription = styled(Description, 'text-sm text-muted-foreground', 'AlertDialogDescription')
