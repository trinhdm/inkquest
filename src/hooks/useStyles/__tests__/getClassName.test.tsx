import { getClassName } from '../getClassName'
import type { SharedConfig } from '../useStyles'
import type { SiteThemeConfig } from '@/lib/theme'

const theme = { prefix: 'ink', prefixSelector: (name: string) => `.ink-${ name }` } as unknown as SiteThemeConfig

const args = (
	overrides: Partial<SharedConfig<object>> = {}
): SharedConfig<object> => ({
	check: { isRoot: true, isUnstyled: false },
	classes: undefined,
	config: undefined,
	name: 'Button',
	prefix: 'ink',
	props: {},
	selector: 'root',
	theme,
	...overrides,
} as unknown as SharedConfig<object>)

describe('getClassName', () => {
	describe('base naming', () => {
		it('builds a prefixed kebab-case base class for the root selector', () => {
			expect(getClassName(args())).toBe('ink-button')
		})

		it('appends `__<selector>` for a non-root selector', () => {
			expect(getClassName(args({
				check: { isRoot: false, isUnstyled: false },
				selector: 'icon',
			}))).toBe('ink-button__icon')
		})

		it('kebab-cases a multi-word component name', () => {
			expect(getClassName(args({ name: 'ButtonGroup' }))).toBe('ink-button-group')
		})

		it('does not double up the prefix when the name already starts with it', () => {
			expect(getClassName(args({ name: 'InkButton' }))).toBe('ink-button')
		})

		it('omits the prefix entirely when none is configured', () => {
			expect(getClassName(args({ prefix: undefined }))).toBe('button')
		})
	})

	describe('CSS-module resolution', () => {
		// `getClassName` always keeps the deterministic base class alongside
		// the resolved (possibly hashed) style class -- it never replaces one
		// with the other -- so both appear in the final class list.
		it('appends the resolved hashed class alongside the base class when the module map has an entry', () => {
			const classes = { 'ink-button': 'Button_ink-button__aB3xY' }

			expect(getClassName(args({ classes }))).toBe(
				cxJoin('ink-button', 'Button_ink-button__aB3xY')
			)
		})

		it('falls back to just the unhashed base class name when the module map has no matching entry', () => {
			const classes = { 'some-other-class': 'Other_hash__z' }

			expect(getClassName(args({ classes }))).toBe('ink-button')
		})

		it('ignores the module map entirely when `unstyled` styling is active', () => {
			const classes = { 'ink-button': 'Button_ink-button__aB3xY' }

			expect(getClassName(args({
				check: { isRoot: true, isUnstyled: true },
				classes,
			}))).toBe('ink-button')
		})
	})

	describe('config-driven modifier classes', () => {
		it('config === true appends the base classname for the selector itself', () => {
			expect(getClassName(args({ config: true, selector: 'icon' }))).toBe(
				cxJoin('ink-button', 'ink-icon')
			)
		})

		it('a single string modifier under `selector` scope is namespaced to the component + selector', () => {
			expect(getClassName(args({
				config: { selector: 'lg' },
			}))).toBe(cxJoin('ink-button', 'ink-button--lg'))
		})

		it('a single string modifier under `global` scope is not namespaced at all', () => {
			expect(getClassName(args({
				config: { global: 'active' },
			}))).toBe(cxJoin('ink-button', 'ink-active'))
		})

		it('a single string modifier under `module` scope is namespaced to the raw component name', () => {
			expect(getClassName(args({
				config: { module: 'loading' },
			}))).toBe(cxJoin('ink-button', 'ink-button--loading'))
		})

		it('an array of modifiers produces one modifier class per entry', () => {
			expect(getClassName(args({
				config: { selector: ['sm', 'block'] },
			}))).toBe(cxJoin('ink-button', 'ink-button--sm', 'ink-button--block'))
		})

		it('an object of modifiers only includes keys with a truthy value', () => {
			expect(getClassName(args({
				config: { selector: { sm: true, block: false, disabled: true } },
			}))).toBe(cxJoin('ink-button', 'ink-button--sm', 'ink-button--disabled'))
		})

		it('combines multiple config scopes on the same call', () => {
			expect(getClassName(args({
				config: { global: 'active', selector: 'lg' },
			}))).toBe(cxJoin('ink-button', 'ink-active', 'ink-button--lg'))
		})
	})

	describe('className inheritance from props', () => {
		it('leaves the class list untouched when props.className is absent', () => {
			expect(getClassName(args())).toBe('ink-button')
		})

		it('replaces the base classname with an inherited prefixed root class on the root selector', () => {
			expect(getClassName(args({
				props: { className: 'ink-card' },
			}))).toBe('ink-card')
		})

		it('drops an inherited class that does not carry the theme prefix and falls back to the base classname', () => {
			expect(getClassName(args({
				check: { isRoot: true, isUnstyled: true },
				props: { className: 'not-prefixed' },
			}))).toBe('ink-button')
		})

		it('appends `__<selector>` to an inherited class for a non-root selector', () => {
			expect(getClassName(args({
				check: { isRoot: false, isUnstyled: false },
				name: 'Icon',
				props: { className: 'ink-card' },
				selector: 'icon',
			}))).toBe('ink-card__icon')
		})

		it('does not inherit a modifier (`--`) class and falls back to the element base classname', () => {
			expect(getClassName(args({
				check: { isRoot: false, isUnstyled: false },
				name: 'Icon',
				props: { className: 'ink-card--lg' },
				selector: 'icon',
			}))).toBe('ink-icon__icon')
		})
	})
})

// mirrors clsx's join semantics for readable expected-value construction
const cxJoin = (...classes: (string | undefined)[]) =>
	classes.filter(Boolean).join(' ')
