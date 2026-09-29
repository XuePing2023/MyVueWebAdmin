import { styled } from '@/utils/component'

export const Card = styled('div', 'rounded-xl border border-border bg-card text-card-foreground shadow-sm', 'Card')

export const CardHeader = styled('div', 'flex flex-col gap-1.5 p-6', 'CardHeader')

export const CardTitle = styled('div', 'font-semibold leading-none tracking-tight', 'CardTitle')

export const CardDescription = styled('div', 'text-sm text-muted-foreground', 'CardDescription')

export const CardContent = styled('div', 'p-6 pt-0', 'CardContent')

export const CardFooter = styled('div', 'flex items-center p-6 pt-0', 'CardFooter')
