import { extractOthers, filterProps, styleProps } from '../helpers'

describe('filterProps', () => {
	it('returns a shallow copy of all own enumerable keys by default (omitEmpty=false)', () => {
		const input = { a: 1, b: '', c: false, d: null, e: undefined }
		expect(filterProps(input)).toEqual({ a: 1, b: '', c: false, d: null, e: undefined })
	})

	it('drops keys with falsy values when omitEmpty is true', () => {
		const input = { a: 1, b: '', c: false, d: null, e: undefined, f: 0 }
		expect(filterProps(input, true)).toEqual({ a: 1 })
	})

	it('keeps a key with an empty-but-truthy-typed value such as a non-empty string', () => {
		expect(filterProps({ label: 'ok' }, true)).toEqual({ label: 'ok' })
	})

	it('returns an empty object when given an empty object', () => {
		expect(filterProps({})).toEqual({})
		expect(filterProps({}, true)).toEqual({})
	})
})

describe('styleProps', () => {
	it('passes props through unchanged when no style-alias keys are present', () => {
		expect(styleProps({ id: 'x', disabled: true })).toEqual({ id: 'x', disabled: true })
	})

	it('renames a bare `classNames` prop to `className`', () => {
		expect(styleProps({ classNames: 'foo' })).toEqual({ className: 'foo' })
	})

	it('renames a bare `styles` prop to `style`', () => {
		expect(styleProps({ styles: { color: 'red' } })).toEqual({ style: { color: 'red' } })
	})

	it('merges className and classNames together into a single className string', () => {
		const result = styleProps({ className: 'a', classNames: 'b' })
		expect(result.className).toContain('a')
		expect(result.className).toContain('b')
	})

	it('merges style and styles into a single object, with styles taking precedence on conflicts', () => {
		expect(
			styleProps({ style: { color: 'red', margin: 1 }, styles: { color: 'blue' } })
		).toEqual({ style: { color: 'blue', margin: 1 } })
	})

	it('omits the className key entirely when neither alias produces a non-empty string', () => {
		const result = styleProps({ classNames: undefined, id: 'x' } as any)
		expect(result).not.toHaveProperty('className')
		expect(result).toEqual({ id: 'x' })
	})

	it('omits the style key entirely when the merged style object has no entries', () => {
		const result = styleProps({ style: {}, styles: {}, id: 'x' })
		expect(result).not.toHaveProperty('style')
		expect(result).toEqual({ id: 'x' })
	})

	it('keeps unrelated props alongside the resolved className/style', () => {
		const result = styleProps({ id: 'x', className: 'foo', disabled: true })
		expect(result).toEqual({ id: 'x', className: 'foo', disabled: true })
	})
})

describe('extractOthers', () => {
	it('returns the leftover props flat, with no `others`/`as`/`withinView` wrapper keys', () => {
		const result = extractOthers({ id: 'x', 'data-testid': 'y' })
		expect(result).toEqual({ id: 'x', 'data-testid': 'y' })
		expect(result).not.toHaveProperty('others')
		expect(result).not.toHaveProperty('as')
		expect(result).not.toHaveProperty('withinView')
	})

	it('strips `as` out entirely instead of returning it', () => {
		const result = extractOthers({ as: 'a' as const, id: 'x' })
		expect(result).toEqual({ id: 'x' })
		expect(result).not.toHaveProperty('as')
	})

	it('strips `withinView` out entirely instead of returning it', () => {
		const result = extractOthers({ withinView: true, id: 'x' })
		expect(result).toEqual({ id: 'x' })
		expect(result).not.toHaveProperty('withinView')
	})

	it('strips `childName` out entirely', () => {
		const result = extractOthers({ childName: 'Icon', id: 'x' })
		expect(result).toEqual({ id: 'x' })
		expect(result).not.toHaveProperty('childName')
	})

	it('strips `children` out entirely', () => {
		const result = extractOthers({ children: 'hi', id: 'x' })
		expect(result).toEqual({ id: 'x' })
		expect(result).not.toHaveProperty('children')
	})

	it('strips `displayName` out entirely', () => {
		const result = extractOthers({ displayName: 'Button', id: 'x' })
		expect(result).toEqual({ id: 'x' })
		expect(result).not.toHaveProperty('displayName')
	})

	it('strips `loading` out entirely', () => {
		const result = extractOthers({ loading: true, id: 'x' })
		expect(result).toEqual({ id: 'x' })
		expect(result).not.toHaveProperty('loading')
	})

	it('strips `revealFrom` out entirely', () => {
		const result = extractOthers({ revealFrom: 20, id: 'x' })
		expect(result).toEqual({ id: 'x' })
		expect(result).not.toHaveProperty('revealFrom')
	})

	it('drops the style alias keys entirely, rather than merging them into a resolved className/style', () => {
		const result = extractOthers({
			className: 'a',
			classNames: 'b',
			style: { color: 'red' },
			styles: { color: 'blue' },
			id: 'x',
		})

		expect(result).toEqual({ id: 'x' })
		expect(result).not.toHaveProperty('className')
		expect(result).not.toHaveProperty('classNames')
		expect(result).not.toHaveProperty('style')
		expect(result).not.toHaveProperty('styles')
	})

	it('strips `animated` out entirely, now that it is a reserved key', () => {
		const result = extractOthers({ animated: true, id: 'x' })
		expect(result).toEqual({ id: 'x' })
		expect(result).not.toHaveProperty('animated')
	})

	it('passes `href` through untouched, since it is not a reserved key', () => {
		const result = extractOthers({ href: '/x', id: 'x' })
		expect(result).toEqual({ href: '/x', id: 'x' })
	})

	it('passes `disabled` through untouched, since it is not a reserved key', () => {
		const result = extractOthers({ disabled: true, id: 'x' })
		expect(result).toEqual({ disabled: true, id: 'x' })
	})

	it('returns an empty object for an input with no extra props at all', () => {
		expect(extractOthers({})).toEqual({})
	})

	it('returns an empty object when every supplied prop is a reserved key', () => {
		const result = extractOthers({
			as: 'span' as const,
			childName: 'Icon',
			children: 'hi',
			className: 'a',
			classNames: 'b',
			displayName: 'X',
			loading: true,
			revealFrom: 10,
			style: {},
			styles: {},
			withinView: true,
		})

		expect(result).toEqual({})
	})

	it('keeps a falsy-but-present leftover prop, showing filterProps is called without omitEmpty', () => {
		expect(extractOthers({ id: '' })).toEqual({ id: '' })
		expect(extractOthers({ hidden: false })).toEqual({ hidden: false })
	})

	it('keeps a reserved prop when it is named in the `keep` list, while still stripping other reserved props -- the escape hatch used by StatisticGroup to forward cascade props to Group', () => {
		const result = extractOthers(
			{ animated: true, duration: 3000, loading: true, id: 'x' },
			['animated', 'duration'],
		)

		expect(result).toEqual({ animated: true, duration: 3000, id: 'x' })
		expect(result).not.toHaveProperty('loading')
	})
})
