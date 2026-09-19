import { extractOtherProps, filterProps, styleProps } from '../props'

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

describe('extractOtherProps', () => {
	it('extracts `as` and returns it at the top level', () => {
		const { as } = extractOtherProps({ as: 'a' as const })
		expect(as).toBe('a')
	})

	it('returns `as` as undefined when it was not supplied', () => {
		const { as } = extractOtherProps({ label: 'hi' })
		expect(as).toBeUndefined()
	})

	it('extracts `withinView` and returns it at the top level', () => {
		const { withinView } = extractOtherProps({ withinView: true })
		expect(withinView).toBe(true)
	})

	it('passes arbitrary unrecognized props through into `others` untouched', () => {
		const { others } = extractOtherProps({ id: 'x', 'data-testid': 'y' })
		expect(others).toEqual({ id: 'x', 'data-testid': 'y' })
	})

	it('strips `revealed` out entirely - it is neither returned at the top level nor kept in `others`', () => {
		const result = extractOtherProps({ revealed: true, id: 'x' })
		expect(result.others).toEqual({ id: 'x' })
		expect(result).not.toHaveProperty('revealed')
		expect((result.others as any).revealed).toBeUndefined()
	})

	it('strips `animated` out entirely', () => {
		const result = extractOtherProps({ animated: true, id: 'x' })
		expect(result.others).toEqual({ id: 'x' })
		expect((result as any).animated).toBeUndefined()
	})

	it('strips `loading` out entirely', () => {
		const result = extractOtherProps({ loading: true, id: 'x' })
		expect(result.others).toEqual({ id: 'x' })
		expect((result as any).loading).toBeUndefined()
	})

	it('strips `displayName` out entirely', () => {
		const result = extractOtherProps({ displayName: 'Button', id: 'x' })
		expect(result.others).toEqual({ id: 'x' })
		expect((result as any).displayName).toBeUndefined()
	})

	it('strips `className`/`classNames` and `style`/`styles` out of `others` without folding them into a resolved style', () => {
		const result = extractOtherProps({
			className: 'a',
			classNames: 'b',
			style: { color: 'red' },
			styles: { color: 'blue' },
			id: 'x',
		})

		expect(result.others).toEqual({ id: 'x' })
		expect(result.others).not.toHaveProperty('className')
		expect(result.others).not.toHaveProperty('style')
	})

	it('returns `others` as an empty object when every supplied prop is one of the extracted/stripped keys', () => {
		const { others, as, withinView } = extractOtherProps({
			animated: true,
			loading: true,
			revealed: true,
			displayName: 'X',
		})

		expect(others).toEqual({})
		expect(as).toBeUndefined()
		expect(withinView).toBeUndefined()
	})

	it('keeps `as` and `withinView` independent of each other and of the stripped keys', () => {
		const { as, withinView, others } = extractOtherProps({
			as: 'span' as const,
			withinView: false,
			loading: true,
			href: '/x',
		})

		expect(as).toBe('span')
		expect(withinView).toBe(false)
		expect(others).toEqual({ href: '/x' })
	})

	it('returns an empty `others` object for an input with no extra props at all', () => {
		const { others } = extractOtherProps({})
		expect(others).toEqual({})
	})
})
