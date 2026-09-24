import { prefixAttributes } from './prefixAttributes'

describe('prefixAttributes', () => {
	it('prefixes each key with "aria-", keeping an already-correct name intact', () => {
		expect(prefixAttributes({ describedby: 'hint-id' }, 'aria'))
			.toEqual({ 'aria-describedby': 'hint-id' })
	})

	it('prefixes each key with "data-" and kebab-cases a camelCase key, coercing a true boolean to an empty string', () => {
		expect(prefixAttributes({ someFlag: true }, 'data'))
			.toEqual({ 'data-some-flag': '' })
	})

	it('coerces a boolean true value to an empty string for a "data" prefix, per idiomatic boolean data attributes', () => {
		expect(prefixAttributes({ open: true }, 'data'))
			.toEqual({ 'data-open': '' })
	})

	it('does NOT coerce a boolean true value for an "aria" prefix, since ARIA requires the literal string "true"', () => {
		expect(prefixAttributes({ expanded: true }, 'aria'))
			.toEqual({ 'aria-expanded': true })
	})

	it('drops a key whose value fails hasValue: empty string, empty array, empty object, null, and undefined', () => {
		expect(prefixAttributes({
			label: '',
			tags: [] as string[],
			meta: {},
			missing: undefined,
			absent: null,
		}, 'data')).toEqual({})
	})

	it('keeps a key with a non-empty array or non-empty object value', () => {
		expect(prefixAttributes({ tags: ['a'], meta: { x: 1 } }, 'data'))
			.toEqual({ 'data-tags': ['a'], 'data-meta': { x: 1 } })
	})

	it('keeps a defined-but-falsy primitive, such as 0 or false, since hasValue only rejects null/undefined/empty', () => {
		expect(prefixAttributes({ count: 0, active: false }, 'data'))
			.toEqual({ 'data-count': 0, 'data-active': false })
	})

	it('returns an empty object when the attributes argument itself is undefined', () => {
		expect(prefixAttributes(undefined, 'data')).toEqual({})
	})
})
