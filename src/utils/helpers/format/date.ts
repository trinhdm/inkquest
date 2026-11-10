import type {
	CalendarDate, DatePart, ElapsedTime,
	IsoDuration, TimeFormat,
} from '@/types/shared'

//	date

const isAbbrev = (key: DatePart, withAbbr: DatePart[] | true) =>
	withAbbr === true || withAbbr.includes(key)

const readDate = (key: DatePart, date: CalendarDate) =>
	String(date[key] ?? '').trim()

export const formatDate = (
	date?: CalendarDate,
	withAbbr: DatePart[] | true = [],
): string => {
	if (!date) return ''

	const month = readDate('month', date),
		day = readDate('day', date),
		year = readDate('year', date)

	const parts = [
		month && (isAbbrev('month', withAbbr) ? month.slice(0, 3) : month),
		day && (year ? `${day},` : day),
		year && (isAbbrev('year', withAbbr) ? `'${year.slice(-2)}` : year),
	]

	return parts.filter(Boolean).join(' ')
}

//	time

interface TimeDuration {
	days: number
	hours: number
	minutes: number
	seconds: number
}

const splitDuration = (
	duration: TimeDuration,
	format?: TimeFormat,
): number[] => {
	const { days, hours, minutes, seconds } = duration

	switch (format) {
		case 'DD:HH:MM:SS':	return [days, hours, minutes, seconds]
		case 'HH:MM:SS':	return [hours, minutes, seconds]
		case 'MM:SS':		return [minutes, seconds]
		case ':SS':			return [seconds]
		default:            return [minutes, seconds]
	}
}

const formatIso = (
	isExpired: boolean,
	timeLeft: ElapsedTime,
	format?: TimeFormat
): IsoDuration => {
	if (isExpired) return 'P0D'

	const timespan = timeLeft.split(':').map(Number)
	let d, h, m, s

	switch (format) {
		case 'DD:HH:MM:SS':
			[d, h, m, s] = timespan
			return `P${d}DT${h}H${m}M${s}S`
		case 'HH:MM:SS':
			[h, m, s] = timespan
			return `PT${h}H${m}M${s}S`
		case 'MM:SS':
			[m, s] = timespan
			return `PT${m}M${s}S`
		case ':SS':
			[s] = timespan
			return `PT${s}S`
		default:
			return 'P0D'
	}
}

export const formatTime = (
	time: number,
	format: TimeFormat = 'MM:SS',
) => {
	const seconds = Math.floor((time / 1000) % 60),
		minutes = Math.floor((time / 1000 / 60) % 60),
		hours = Math.floor((time / (1000 * 60 * 60)) % 24),
		days = Math.floor(time / (1000 * 60 * 60 * 24))

	const duration = { days, hours, minutes, seconds },
		timespan = splitDuration(duration, format)

	const timeLeft = timespan.map(num => String(num).padStart(2, '0')).join(':') as ElapsedTime,
		isExpired = time === 0,
		isoDuration = formatIso(isExpired, timeLeft, format)

	return {
		days, hours, minutes, seconds,
		isExpired, isoDuration, timeLeft,
	}
}
