import { configDocument, type DocumentConfig } from './utils'
import { DEFAULT_COLOR_SCHEME, JS_ANIMATE_KEY, SCHEME_STORAGE_KEY } from './constants'

describe('configDocument', () => {
	it('returns full defaults when called with no arguments', () => {
		expect(configDocument()).toEqual({
			keys: {
				jsAnimate: JS_ANIMATE_KEY,
				localStore: SCHEME_STORAGE_KEY,
			},
			scheme: DEFAULT_COLOR_SCHEME,
		})
	})

	it('deep-merges a partial keys object instead of replacing its sibling key', () => {
		const result = configDocument({ keys: { localStore: 'custom-key' } })

		expect(result.keys).toEqual({
			jsAnimate: JS_ANIMATE_KEY,
			localStore: 'custom-key',
		})
	})

	it('falls back to the default when a key is explicitly undefined', () => {
		const args: DocumentConfig = { keys: { localStore: undefined } }
		const result = configDocument(args)

		expect(result.keys.localStore).toBe(SCHEME_STORAGE_KEY)
	})

	it('lets an explicit empty string win over the default (deepMerge uses ?? not ||)', () => {
		const result = configDocument({ keys: { localStore: '' } })

		expect(result.keys.localStore).toBe('')
	})

	it('preserves extra caller fields that are not part of DocumentConfig', () => {
		const result = configDocument({ override: 'light' })

		expect(result).toMatchObject({ override: 'light' })
		expect(result.scheme).toBe(DEFAULT_COLOR_SCHEME)
	})

	it('honours an explicit scheme override', () => {
		const result = configDocument({ scheme: 'light' })

		expect(result.scheme).toBe('light')
		expect(result.keys).toEqual({
			jsAnimate: JS_ANIMATE_KEY,
			localStore: SCHEME_STORAGE_KEY,
		})
	})
})
