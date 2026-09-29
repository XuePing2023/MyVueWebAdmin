import { TabsContent as Content, TabsList as List, TabsRoot as Root, TabsTrigger as Trigger } from 'reka-ui'

import { styled } from '@/utils/component'

export const Tabs = Root

export const TabsList = styled(
  List,
  'inline-flex h-9 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground',
  'TabsList',
)

export const TabsTrigger = styled(
  Trigger,
  'inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium transition-all focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm',
  'TabsTrigger',
)

export const TabsContent = styled(Content, 'mt-2 focus-visible:outline-none', 'TabsContent')
