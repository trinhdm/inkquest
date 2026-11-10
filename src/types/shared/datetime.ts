import type { Digit, TwoDigit } from './common'
import type { StrToNum } from '../utils'
import type { MONTH_NAMES } from '@/utils/constants'

//	date

type MonthName =
	typeof MONTH_NAMES[number]

type CalendarDay =
	| Exclude<Digit, '0'>
	| TwoDigit<'1' | '2'>
	| TwoDigit<'3', '0' | '1'>

type CalendarYear =
	| `19${TwoDigit}`
	| `20${TwoDigit<'0' | '1'>}`
	| `20${TwoDigit<'2', Exclude<Digit, '7' | '8' | '9'>>}`

export interface CalendarDate {
	month: MonthName
	day?: CalendarDay | StrToNum<CalendarDay>
	year: CalendarYear | StrToNum<CalendarYear>
}

export type DatePart =
	keyof CalendarDate

//	time

type Hour =
	| TwoDigit<'0' | '1'>
	| TwoDigit<'2', '0' | '1' | '2' | '3'>

type MinuteSecond =
	| TwoDigit<'0' | '1' | '2' | '3' | '4' | '5', Digit>

export type ClockTime =
	`${Hour}:${MinuteSecond}:${MinuteSecond}`			//	HH:MM:SS

export type TimeFormat =
	| 'DD:HH:MM:SS' | 'HH:MM:SS'
	| 'MM:SS' | ':SS'

export type ElapsedTime =
	| `${number}:${number}:${number}:${number}`
	| `${number}:${number}:${number}`
	| `${number}:${number}`
	| `:${number}`

//	iso duration

type YearIso	= `${number}Y`
type MonthIso	= `${number}M`
type WeekIso	= `${number}W`
type DayIso		= `${number}D`

type HourIso	= `${number}H`
type MinuteIso	= `${number}M`
type SecondIso	= `${number}S`

type DateIso =
	| YearIso | MonthIso | WeekIso | DayIso
	| `${YearIso}${MonthIso}${DayIso}`
	| `${YearIso}${MonthIso}`
	| `${MonthIso}${DayIso}`

type TimeIso =
	| HourIso | MinuteIso | SecondIso
	| `${HourIso}${MinuteIso}${SecondIso}`
	| `${HourIso}${MinuteIso}`
	| `${MinuteIso}${SecondIso}`

export type IsoDuration =
	| `P${DateIso}`
	| `PT${TimeIso}`
	| `P${DateIso}T${TimeIso}`

