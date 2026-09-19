import { buildScript } from './buildScript'
import { DEFAULT_COLOR_SCHEME, SCHEME_STORAGE_KEY } from '../constants'

describe('buildScript', () => {
	it('returns an empty string when lsKey is explicitly empty', () => {
		expect(buildScript({ keys: { localStore: '' } })).toBe('')
	})

	it('short-circuits to a static setAttribute call when override is provided', () => {
		const script = buildScript({ override: 'light' })

		expect(script).toContain(
			`document.documentElement.setAttribute("data-${ SCHEME_STORAGE_KEY }", "light");`
		)
	})

	it('prefers override over scheme when both are provided', () => {
		const script = buildScript({ override: 'dark', scheme: 'light' })

		expect(script).toContain('"dark"')
		expect(script).not.toContain('"light"')
	})

	it('uses a custom lsKey in the override branch', () => {
		const script = buildScript({ keys: { localStore: 'custom-key' }, override: 'dark' })

		expect(script).toContain('document.documentElement.setAttribute("data-custom-key", "dark");')
	})

	it('falls back to SCHEME_STORAGE_KEY when lsKey is omitted', () => {
		const script = buildScript({ override: 'dark' })

		expect(script).toContain(`data-${ SCHEME_STORAGE_KEY }`)
	})

	it('falls back to DEFAULT_COLOR_SCHEME when no scheme is provided (no override)', () => {
		const script = buildScript({})

		expect(script).toContain(`"${ DEFAULT_COLOR_SCHEME }"`)
	})

	it('builds an IIFE that reads localStorage and falls back to matchMedia', () => {
		const script = buildScript({ scheme: 'light' })

		expect(script).toContain(';(function() {')
		expect(script).toContain('localStorage.getItem("' + SCHEME_STORAGE_KEY + '")')
		expect(script).toContain('window.matchMedia("(prefers-color-scheme: dark)")')
		expect(script).toContain(`document.documentElement.setAttribute("data-${ SCHEME_STORAGE_KEY }", initScheme);`)
	})

	it('computes the alternate scheme as the opposite of dark', () => {
		const script = buildScript({ scheme: 'dark' })

		// alt of "dark" is "light" — the guard should compare against both
		expect(script).toContain('lsScheme !== "dark" && lsScheme !== "light"')
		// matchMedia fallback still resolves to the requested scheme ("dark")
		expect(script).toContain('? "dark" : "dark"')
	})

	it('computes the alternate scheme as the opposite of light', () => {
		const script = buildScript({ scheme: 'light' })

		expect(script).toContain('lsScheme !== "light" && lsScheme !== "dark"')
		expect(script).toContain('? "dark" : "light"')
	})

	it('wraps localStorage access in a try/catch so a disabled storage API does not throw', () => {
		const script = buildScript({ scheme: 'dark' })

		expect(script).toContain('try {')
		expect(script).toContain('} catch(e) {}')
	})

	it('uses a custom lsKey throughout the generated IIFE', () => {
		const script = buildScript({ keys: { localStore: 'my-key' }, scheme: 'dark' })

		expect(script).toContain('localStorage.getItem("my-key")')
		expect(script).toContain('document.documentElement.setAttribute("data-my-key", initScheme);')
	})
})
