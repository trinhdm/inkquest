import type { Digit, DigitIn } from './common'
import type { StrToNum } from '../utils'
import type { MONTH_NAMES } from '@/utils/constants'

type MonthName =
	typeof MONTH_NAMES[number]

type DayNum<N1 extends Digit | null = null, N2 extends Digit | null = null> =
	`${DigitIn<N1>}${DigitIn<N2>}`

type CalendarDay =
	| `${Exclude<Digit, '0'>}`
	| `${DayNum<'1' | '2'>}`
	| `${DayNum<'3', '0' | '1'>}`

type CalendarYear =
	| `19${DayNum}`
	| `20${DayNum<'1'>}`
	| `20${DayNum<'2', Exclude<Digit, '7' | '8' | '9'>>}`

export interface CalendarDate {
	month: MonthName
	day?: CalendarDay | StrToNum<CalendarDay>
	year: CalendarYear | StrToNum<CalendarYear>
}
