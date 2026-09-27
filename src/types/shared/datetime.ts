import type { Digit } from './common'
import type { MONTH_NAMES } from '@/utils/constants'

type MonthName = typeof MONTH_NAMES[number]
type CalendarYear = `19${Digit}${Digit}` | `20${Digit}${Digit}`

export interface CalendarDate {
	month: MonthName
	year: CalendarYear | number
}
