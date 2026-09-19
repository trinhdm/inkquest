import { useProps } from '../useProps'
import { resetComponentDefaults, setDefaultProps } from '../defaultsRegistry'
import { resetVariantStyles } from '@/lib/registries'

// `useProps` fills registered defaults in BEFORE merging the caller's own
// props, and only overwrites a key the caller *actually passed* (i.e. the
// value at that key isn't `undefined`). This precedence rule is the exact
// spot where a real bug lived: a component that defaults a flag belonging
// to a mutually-exclusive prop group will bleed that default into every
// render, even when the caller's discriminated-union props never mention it.

describe('useProps', () => {
	afterEach(() => {
		resetComponentDefaults()
		resetVariantStyles()
	})

	it('lets an explicit prop win over a registered default for the same key', () => {
		setDefaultProps('UsePropsFixture.Explicit', { size: 'sm' })

		const result = useProps('UsePropsFixture.Explicit', { size: 'lg' })

		expect(result).toEqual({ size: 'lg' })
	})

	it('does not let an explicit `undefined` clobber a registered default', () => {
		setDefaultProps('UsePropsFixture.ExplicitUndefined', { size: 'sm' })

		const result = useProps('UsePropsFixture.ExplicitUndefined', { size: undefined })

		expect(result).toEqual({ size: 'sm' })
	})

	it('keeps a registered default when the caller never mentions the key', () => {
		setDefaultProps('UsePropsFixture.DefaultOnly', { size: 'sm', variant: 'solid' })

		const result = useProps('UsePropsFixture.DefaultOnly', { variant: 'outline' })

		expect(result).toEqual({ size: 'sm', variant: 'outline' })
	})

	it('keeps a caller prop that has no registered default', () => {
		// No `setDefaultProps` call at all for this name.
		const result = useProps('UsePropsFixture.NoDefault', { label: 'hi' })

		expect(result).toEqual({ label: 'hi' })
	})

	it('returns just the caller props untouched when no defaults are registered for the name', () => {
		const result = useProps('UsePropsFixture.Unregistered', { a: 1, b: 2 })

		expect(result).toEqual({ a: 1, b: 2 })
	})

	it('resolves array names by joining truthy segments with "."', () => {
		setDefaultProps('UsePropsFixture.Group.Item', { size: 'md' })

		const result = useProps(['UsePropsFixture.Group', 'Item'], {})

		expect(result).toEqual({ size: 'md' })
	})

	it('treats an all-falsy array name as producing no default lookup match', () => {
		// `name` itself (the array) is truthy, but every element is filtered
		// out, so the joined target is `''` — an unregistered name.
		const result = useProps([undefined, undefined], { label: 'hi' })

		expect(result).toEqual({ label: 'hi' })
	})

	it('does not apply defaults at all when name is undefined', () => {
		setDefaultProps('UsePropsFixture.Unused', { size: 'sm' })

		const result = useProps(undefined, { size: 'lg' })

		expect(result).toEqual({ size: 'lg' })
	})

	// The precedence trap: a component registers a non-empty default for one
	// flag out of a mutually-exclusive pair. A caller using a discriminated
	// union only ever passes the *other* flag, so the caller's props object
	// never contains the defaulted key at all — and `useProps` has no way to
	// know the two are meant to be exclusive. The default survives untouched
	// alongside the caller's flag. This is documented, current behavior of
	// `useProps` — the actual fix belongs in the component's own
	// `setDefaults` call (as it did for `ButtonSection`, which now defaults
	// to `{}`), not in this hook.
	it('bleeds a defaulted flag through when the caller only passes the mutually-exclusive counterpart', () => {
		setDefaultProps('UsePropsFixture.Side', { left: true })

		const result = useProps('UsePropsFixture.Side', { right: true } as { left?: boolean, right?: boolean })

		expect(result).toEqual({ left: true, right: true })
	})

	it('does not bleed the default through when the component defaults to `{}` instead', () => {
		setDefaultProps('UsePropsFixture.SideFixed', {})

		const result = useProps('UsePropsFixture.SideFixed', { right: true } as { left?: boolean, right?: boolean })

		expect(result).toEqual({ right: true })
	})
})
