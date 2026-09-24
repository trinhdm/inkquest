import { handleTheme, mergeTheme } from '../handleTheme'
import { tokens } from '@/lib/theme'
import { DEFAULT_THEME } from '../../constants'

describe('mergeTheme', () => {
	it('returns the current theme unchanged (same reference) when no override is given', () => {
		const result = mergeTheme(DEFAULT_THEME)

		expect(result).toBe(DEFAULT_THEME)
	})

	it('deep-merges a partial override into nested objects rather than replacing them wholesale', () => {
		const current = { scale: { space: 4 }, colors: { ink: '#000000' } }
		const override = { scale: { space: 8 } }

		const result = mergeTheme(current, override)

		// the untouched sibling key of the merged nested object survives
		expect(result.scale).toEqual({ space: 8 })
		// a sibling top-level key not present in the override is untouched
		expect(result.colors).toEqual({ ink: '#000000' })
	})

	it('replaces arrays wholesale instead of merging element-by-element', () => {
		const current = { fontWeight: [400, 700] }
		const override = { fontWeight: [100, 200, 300] }

		const result = mergeTheme(current, override)

		expect(result.fontWeight).toEqual([100, 200, 300])
	})

	it('lets a primitive override value win over the current primitive value', () => {
		const current = { prefix: 'a' }
		const override = { prefix: 'b' }

		expect(mergeTheme(current, override).prefix).toBe('b')
	})
})

describe('handleTheme', () => {
	it('stores the (possibly merged) theme verbatim on config, by reference', () => {
		const theme = { scale: { space: 4 } }
		const result = handleTheme(theme)

		expect(result.config).toBe(theme)
	})

	it('spreads the shared design tokens onto the returned config object', () => {
		const result = handleTheme(DEFAULT_THEME)

		for (const key of Object.keys(tokens)) {
			expect(result).toHaveProperty(key, (tokens as Record<string, unknown>)[key])
		}
	})

	it('carries the prefix through verbatim, including leaving the key present as undefined when omitted', () => {
		const withPrefix = handleTheme(DEFAULT_THEME, 'inkq')
		const withoutPrefix = handleTheme(DEFAULT_THEME)

		expect(withPrefix.prefix).toBe('inkq')
		expect('prefix' in withoutPrefix).toBe(true)
		expect(withoutPrefix.prefix).toBeUndefined()
	})

	describe('prefixSelector', () => {
		it('kebab-cases the component name into a bare class selector when there is no prefix', () => {
			const { prefixSelector } = handleTheme(DEFAULT_THEME)

			expect(prefixSelector('ButtonGroup')).toBe('.button-group')
			expect(prefixSelector('Card')).toBe('.card')
		})

		it('namespaces the kebab-cased selector with the prefix when one is given', () => {
			const { prefixSelector } = handleTheme(DEFAULT_THEME, 'inkq')

			expect(prefixSelector('Button')).toBe('.inkq-button')
			expect(prefixSelector('ButtonGroup')).toBe('.inkq-button-group')
		})

		it('treats an empty-string prefix as absent (falsy check), not as a zero-length namespace', () => {
			const { prefixSelector } = handleTheme(DEFAULT_THEME, '')

			expect(prefixSelector('Card')).toBe('.card')
		})
	})
})
