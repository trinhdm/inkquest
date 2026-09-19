import { dispatchGenerator } from '../dispatch'

describe('dispatchGenerator', () => {
	it('short-circuits to an empty array for null, undefined, and empty-string values', () => {
		expect(dispatchGenerator({ path: ['x'], value: null })).toEqual([])
		expect(dispatchGenerator({ path: ['x'], value: undefined })).toEqual([])
		expect(dispatchGenerator({ path: ['x'], value: '' })).toEqual([])
	})

	it('short-circuits to an empty array for a function value', () => {
		expect(dispatchGenerator({ path: ['x'], value: () => {} })).toEqual([])
	})

	it('falls through to the primitive strategy for a plain string', () => {
		const entries = dispatchGenerator({ path: ['theme'], value: 'ink' })
		expect(entries).toEqual([{ name: '--theme', value: 'ink' }])
	})

	it('prefers the hex strategy over the primitive strategy for a hex-color string', () => {
		const entries = dispatchGenerator({ path: ['red'], value: '#ff0000' })
		expect(entries).toEqual([{ name: '--red-100', value: '#ff0000' }])
	})

	it('prefers the scale strategy over the primitive strategy when path[0] is "scale" and the value is a number', () => {
		const entries = dispatchGenerator({ path: ['scale'], value: 4 })
		// scaleStrategy always produces exactly 16 steps
		expect(entries).toHaveLength(16)
	})

	it('does not use the scale strategy for a number under any other path', () => {
		const entries = dispatchGenerator({ path: ['count'], value: 4 })
		expect(entries).toEqual([{ name: '--count', value: '4' }])
	})

	it('recurses into nested plain objects via the generate callback, building on the accumulated path', () => {
		const entries = dispatchGenerator({ path: ['border'], value: { radius: { topLeft: '4px' } } })
		expect(entries).toEqual([{ name: '--border-radius-top-left', value: '4px' }])
	})

	it('prefers the shorthand strategy over the nested-object strategy for a font-shaped object', () => {
		const font = { fontFamily: 'Archivo', fontSize: '16px', fontWeight: 400, lineHeight: 1.5 }
		const entries = dispatchGenerator({ path: ['font'], value: font })
		expect(entries).toEqual([{ name: '--font', value: '400 16px/1.5 Archivo' }])
	})
})
