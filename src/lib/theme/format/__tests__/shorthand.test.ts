import { getShorthand } from '../shorthand'

describe('getShorthand', () => {
	it('returns undefined for a property with no registered handler', () => {
		const property = 'border' as unknown as Parameters<typeof getShorthand>[0]['property']
		expect(getShorthand({ property, values: [{}] })).toBeUndefined()
	})

	describe('property: "font"', () => {
		it('assembles weight, size/line-height, and family in CSS font-shorthand order', () => {
			const result = getShorthand({
				property: 'font',
				values: [{
					fontFamily: 'Arial',
					fontSize: '16px',
					lineHeight: '1.5',
					fontWeight: '700',
				}],
			})

			expect(result).toBe('700 16px/1.5 Arial')
		})

		it('omits the line-height slash entirely when no line-height is provided', () => {
			const result = getShorthand({
				property: 'font',
				values: [{ fontSize: '16px', fontFamily: 'Arial' }],
			})

			expect(result).toBe('16px Arial')
		})

		it('drops the size segment entirely when font-size is missing, even if line-height is present', () => {
			const result = getShorthand({
				property: 'font',
				values: [{ lineHeight: '1.5', fontFamily: 'Arial' }],
			})

			expect(result).toBe('Arial')
		})

		it('merges values across multiple source objects, keyed independently', () => {
			const result = getShorthand({
				property: 'font',
				values: [
					{ fontWeight: '700' },
					{ fontSize: '14px', fontFamily: 'Georgia' },
				],
			})

			expect(result).toBe('700 14px Georgia')
		})

		it('lets the first source in the list win when the same key appears in more than one', () => {
			const result = getShorthand({
				property: 'font',
				values: [
					{ fontFamily: 'Georgia' },
					{ fontFamily: 'Arial' },
				],
			})

			expect(result).toBe('Georgia')
		})

		it('returns an empty string when none of the source objects contain any font keys', () => {
			const result = getShorthand({ property: 'font', values: [{}] })

			expect(result).toBe('')
		})

		it('stringifies an explicitly-present "undefined" value rather than treating the key as absent', () => {
			// Object.hasOwn() sees the key regardless of its value, so
			// `{ fontSize: undefined }` produces the literal string "undefined".
			const result = getShorthand({
				property: 'font',
				values: [{ fontSize: undefined }],
			})

			expect(result).toBe('undefined')
		})

		it('does not append the line-height slash when font-size is an empty string, since an empty string is falsy', () => {
			const result = getShorthand({
				property: 'font',
				values: [{ fontSize: '', lineHeight: '1.5' }],
			})

			expect(result).toBe('')
		})
	})
})
