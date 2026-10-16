import type { CalendarDate } from '@/types/shared'

export const formatDate = (
	date?: CalendarDate,
	withAbbr: (keyof CalendarDate)[] | true = [],
): string => {
	if (!date) return ''

	const calendar: string[] = [],
		parts = Object.keys(date) as (keyof CalendarDate)[]

	for (const key of parts) {
		const value = String(date[key]) as Extract<CalendarDate[typeof key], string>

		if (!!value.length) {
			const isAbbrev = Array.isArray(withAbbr) ? withAbbr.includes(key) : true
			let index, output: string = value

			switch (key) {
				case 'month':
					if (isAbbrev) output = value.slice(0, 3)
					index = 0
					break
				case 'day':
					if (parts.includes('year')) output += `,`
					index = 1
					break
				case 'year':
					if (isAbbrev) output = value.slice(-2)
					index = 2
					break
			}

			calendar.splice(index, 0, output)
		}
	}

	return calendar.join(' ')
}
