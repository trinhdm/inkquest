import { formatDate, formatTime } from '../date'
import type { CalendarDate } from '@/types/shared'

describe('formatDate', () => {
	it.each([undefined, null as unknown as undefined])('returns an empty string for %p', date => {
		expect(formatDate(date)).toBe('')
	})

	it('returns an empty string for an empty object', () => {
		expect(formatDate({} as CalendarDate)).toBe('')
	})

	it('formats a full date, the shape LegalHero passes, as "Month D, YYYY"', () => {
		expect(formatDate({ month: 'July', day: 1, year: 2026 })).toBe('July 1, 2026')
	})

	it('accepts the day and year as strings too', () => {
		expect(formatDate({ month: 'March', day: '30', year: '2026' } as CalendarDate)).toBe('March 30, 2026')
	})

	it('drops the comma and day when there is no day', () => {
		expect(formatDate({ month: 'March', year: 2026 })).toBe('March 2026')
	})

	it('omits the comma when there is a day but no year', () => {
		expect(formatDate({ month: 'March', day: 5 } as CalendarDate)).toBe('March 5')
	})

	it('formats a month alone', () => {
		expect(formatDate({ month: 'March' } as CalendarDate)).toBe('March')
	})

	it('skips parts that are empty strings', () => {
		expect(formatDate({ month: 'March', day: '', year: 2026 } as unknown as CalendarDate)).toBe('March 2026')
	})

	it.each([
		['month, year, day', { month: 'July', year: 2026, day: 1 }],
		['year, day, month', { year: 2026, day: 1, month: 'July' }],
		['day, year, month', { day: 1, year: 2026, month: 'July' }],
	] as [string, CalendarDate][])('puts month, day and year in order when the keys are written %s', (_, date) => {
		expect(formatDate(date)).toBe('July 1, 2026')
	})

	it('abbreviates by part, not by key position', () => {
		expect(formatDate({ year: 2026, month: 'September', day: 9 }, true)).toBe("Sep 9, '26")
	})

	it('skips a part whose key is present but undefined', () => {
		expect(formatDate({ month: 'March', day: undefined, year: 2026 })).toBe('March 2026')
	})

	it('drops the comma after the day when the year is empty', () => {
		expect(formatDate({ month: 'March', day: 5, year: '' } as unknown as CalendarDate)).toBe('March 5')
	})

	describe('abbreviations', () => {
		const date: CalendarDate = { month: 'September', day: 9, year: 2026 }

		it('abbreviates only the listed parts', () => {
			expect(formatDate(date, ['month'])).toBe('Sep 9, 2026')
			expect(formatDate(date, ['year'])).toBe("September 9, '26")
		})

		it('abbreviates month and year together', () => {
			expect(formatDate(date, ['month', 'year'])).toBe("Sep 9, '26")
		})

		it('abbreviates everything when passed true', () => {
			expect(formatDate(date, true)).toBe("Sep 9, '26")
		})

		it('leaves the day unchanged when it is listed, since a day has no short form', () => {
			expect(formatDate(date, ['day'])).toBe('September 9, 2026')
		})

		it('applies the month abbreviation when the date has no year', () => {
			expect(formatDate({ month: 'September' } as CalendarDate, ['month'])).toBe('Sep')
		})

		it('does not abbreviate by default', () => {
			expect(formatDate(date)).toBe('September 9, 2026')
		})
	})
})

describe('formatTime', () => {
	const SECOND = 1000,
		MINUTE = 60 * SECOND,
		HOUR = 60 * MINUTE,
		DAY = 24 * HOUR

	// 1 day, 2 hours, 3 minutes, 4 seconds
	const SAMPLE = DAY + 2 * HOUR + 3 * MINUTE + 4 * SECOND

	it('splits milliseconds into days, hours, minutes and seconds', () => {
		const { days, hours, minutes, seconds } = formatTime(SAMPLE)
		expect({ days, hours, minutes, seconds }).toEqual({ days: 1, hours: 2, minutes: 3, seconds: 4 })
	})

	it('rounds each unit down, ignoring leftover milliseconds', () => {
		expect(formatTime(4999).seconds).toBe(4)
	})

	it('defaults to MM:SS, zero-padded', () => {
		const { timeLeft, isoDuration } = formatTime(SAMPLE)
		expect(timeLeft).toBe('03:04')
		expect(isoDuration).toBe('PT3M4S')
	})

	it.each([
		['DD:HH:MM:SS', '01:02:03:04', 'P1DT2H3M4S'],
		['HH:MM:SS', '02:03:04', 'PT2H3M4S'],
		['MM:SS', '03:04', 'PT3M4S'],
		[':SS', '04', 'PT4S'],
	] as const)('renders %s as %s with ISO duration %s', (format, timeLeft, iso) => {
		const result = formatTime(SAMPLE, format)
		expect(result.timeLeft).toBe(timeLeft)
		expect(result.isoDuration).toBe(iso)
		expect(result.isExpired).toBe(false)
	})

	it('pads single digits but leaves wider values alone', () => {
		expect(formatTime(100 * DAY, 'DD:HH:MM:SS').timeLeft).toBe('100:00:00:00')
		expect(formatTime(5 * SECOND, 'DD:HH:MM:SS').timeLeft).toBe('00:00:00:05')
	})

	it('reports zero as expired, with the P0D duration for every format', () => {
		for (const format of ['DD:HH:MM:SS', 'HH:MM:SS', 'MM:SS', ':SS'] as const) {
			const result = formatTime(0, format)
			expect(result.isExpired).toBe(true)
			expect(result.isoDuration).toBe('P0D')
		}
		expect(formatTime(0).timeLeft).toBe('00:00')
	})

	it('does not report one second remaining as expired', () => {
		expect(formatTime(SECOND, ':SS')).toMatchObject({ isExpired: false, timeLeft: '01', isoDuration: 'PT1S' })
	})
})
