import type { CalendarDate, DatePart } from '@/types/shared'

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
