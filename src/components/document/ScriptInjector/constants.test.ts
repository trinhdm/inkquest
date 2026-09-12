import { PREFIX_CSS_SELECTOR } from '@/utils/constants'
import { DEFAULT_COLOR_SCHEME, SCHEME_STORAGE_KEY } from './constants'

describe('ScriptInjector constants', () => {
	it('derives SCHEME_STORAGE_KEY from PREFIX_CSS_SELECTOR', () => {
		expect(SCHEME_STORAGE_KEY).toBe(`${ PREFIX_CSS_SELECTOR }-scheme`)
	})

	it('exposes the inkq-scheme storage key used for both localStorage and the data-* attribute', () => {
		expect(SCHEME_STORAGE_KEY).toBe('inkq-scheme')
	})

	it('defaults the color scheme to dark', () => {
		expect(DEFAULT_COLOR_SCHEME).toBe('dark')
	})
})
