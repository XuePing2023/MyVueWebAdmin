import { AvatarFallback as Fallback, AvatarImage as Image, AvatarRoot as Root } from 'reka-ui'

import { styled } from '@/utils/component'

export const Avatar = styled(Root, 'relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full', 'Avatar')

export const AvatarImage = Image

export const AvatarFallback = styled(
  Fallback,
  'flex h-full w-full items-center justify-center rounded-full bg-secondary text-sm font-medium text-secondary-foreground',
  'AvatarFallback',
)
