import { hasShorthandMatch, isSkippable, labelStep, toEntry, validate } from '../utils'

describe('isSkippable', () => {
	it('treats null as skippable', () => {
		expect(isSkippable(null)).toBe(true)
	})

	it('treats undefined as skippable', () => {
		expect(isSkippable(undefined)).toBe(true)
	})

	it('treats an empty string as skippable', () => {
		expect(isSkippable('')).toBe(true)
	})

	it('treats a function as skippable', () => {
		expect(isSkippable(() => {})).toBe(true)
	})

	it('does not skip the number zero', () => {
		expect(isSkippable(0)).toBe(false)
	})

	it('does not skip a non-empty string', () => {
		expect(isSkippable('value')).toBe(false)
	})

	it('does not skip an object or array', () => {
		expect(isSkippable({})).toBe(false)
		expect(isSkippable([])).toBe(false)
	})
})

describe('labelStep', () => {
	it('zero-pads single-digit positions', () => {
		expect(labelStep(0)).toBe('01')
		expect(labelStep(8)).toBe('09')
	})

	it('stops zero-padding once the position reaches double digits', () => {
		expect(labelStep(9)).toBe('10')
		expect(labelStep(24)).toBe('25')
	})

	it('labels a hex-color value as a hundreds step regardless of position', () => {
		expect(labelStep(0, '#fff')).toBe('100')
		expect(labelStep(2, '#a1b2c3')).toBe('300')
	})

	it('only treats 4- or 7-character #-prefixed strings as hex', () => {
		// not a recognized hex length -> falls back to the padded-index label
		expect(labelStep(0, '#12345')).toBe('01')
	})
})

describe('toEntry', () => {
	it('produces a single-entry array with the value stringified', () => {
		expect(toEntry({ name: '--foo', value: 42 })).toEqual([{ name: '--foo', value: '42' }])
	})

	it('returns an empty array when the name is falsy', () => {
		expect(toEntry({ name: '' as any, value: 'x' })).toEqual([])
	})

	it('returns an empty array when the value is skippable', () => {
		expect(toEntry({ name: '--foo', value: null })).toEqual([])
		expect(toEntry({ name: '--foo', value: undefined })).toEqual([])
		expect(toEntry({ name: '--foo', value: '' })).toEqual([])
	})
})

describe('validate', () => {
	it('recognizes 4- and 7-character #-prefixed strings as hex', () => {
		expect(validate().hex('#fff')).toBe(true)
		expect(validate().hex('#ffffff')).toBe(true)
	})

	it('rejects strings that are not valid hex lengths', () => {
		expect(validate().hex('#ff')).toBe(false)
		expect(validate().hex('red')).toBe(false)
	})

	it('classifies whole numbers as integers', () => {
		expect(validate().numeric.integer(4)).toBe(true)
		expect(validate().numeric.integer(4.5)).toBe(false)
	})

	it('classifies numbers in (0, 1] as percentages', () => {
		expect(validate().numeric.percent(0.5)).toBe(true)
		expect(validate().numeric.percent(1)).toBe(true)
		expect(validate().numeric.percent(0)).toBe(false)
		expect(validate().numeric.percent(1.5)).toBe(false)
	})

	it('classifies positive multiples of 100 as font weights', () => {
		expect(validate().numeric.weight(400)).toBe(true)
		expect(validate().numeric.weight(0)).toBe(false)
		expect(validate().numeric.weight(450)).toBe(false)
	})

	it('matches an object whose keys are exactly the font shorthand keys', () => {
		const font = { fontFamily: 'A', fontSize: '16px', fontWeight: 400, lineHeight: 1.5 }
		expect(validate().shorthand.font(font)).toBe(true)
	})

	it('rejects an object missing a required font shorthand key', () => {
		const font = { fontFamily: 'A', fontSize: '16px', fontWeight: 400 }
		expect(validate().shorthand.font(font)).toBe(false)
	})

	it('rejects an object with an extra key beyond the font shorthand set', () => {
		const font = { fontFamily: 'A', fontSize: '16px', fontWeight: 400, lineHeight: 1.5, extra: true }
		expect(validate().shorthand.font(font)).toBe(false)
	})
})

describe('hasShorthandMatch', () => {
	it('is true for a value matching a registered shorthand shape', () => {
		const font = { fontFamily: 'A', fontSize: '16px', fontWeight: 400, lineHeight: 1.5 }
		expect(hasShorthandMatch(font)).toBe(true)
	})

	it('is false for a plain nested object that is not a registered shorthand', () => {
		expect(hasShorthandMatch({ topLeft: '4px', topRight: '4px' })).toBe(false)
	})

	it('is false for non-object values', () => {
		expect(hasShorthandMatch('#fff')).toBe(false)
		expect(hasShorthandMatch(4)).toBe(false)
	})
})
