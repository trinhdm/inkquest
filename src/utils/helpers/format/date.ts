import type { CalendarDate } from '@/types/shared'

export const formatDate = (
	date?: CalendarDate,
	isAbbrev: boolean = false,
): string => {
	if (!date) return ''

	const calendar: string[] = [],
		parts = Object.keys(date) as (keyof CalendarDate)[]

	for (const key of parts) {
		const value = String(date[key]) as Extract<CalendarDate[typeof key], string>

		if (!!value.length) {
			let output: string = value

			if (key === 'month') {
				if (isAbbrev) output = value.slice(0, 3)
				if (parts.includes('day')) output += `,`
			}

			calendar.push(output)
		}
	}

	return calendar.join(' ')
}
