import { TooltipContent as Content, TooltipProvider as Provider, TooltipRoot as Root, TooltipTrigger as Trigger } from 'reka-ui'

import { styled } from '@/utils/component'

export const TooltipProvider = Provider
export const Tooltip = Root
export const TooltipTrigger = Trigger

export const TooltipContent = styled(
  Content,
  'z-50 overflow-hidden rounded-md bg-primary px-3 py-1.5 text-xs text-primary-foreground',
  'TooltipContent',
)
