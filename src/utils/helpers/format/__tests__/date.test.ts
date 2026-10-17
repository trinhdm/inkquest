import { formatDate } from '../date'
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
		expect(formatDate({ year: 2026, month: 'September', day: 9 }, true)).toBe('Sep 9, 26')
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
			expect(formatDate(date, ['year'])).toBe('September 9, 26')
		})

		it('abbreviates month and year together', () => {
			expect(formatDate(date, ['month', 'year'])).toBe('Sep 9, 26')
		})

		it('abbreviates everything when passed true', () => {
			expect(formatDate(date, true)).toBe('Sep 9, 26')
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
