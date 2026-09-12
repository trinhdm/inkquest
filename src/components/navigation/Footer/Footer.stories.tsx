import { Footer } from './Footer'
import { expect } from 'storybook/test'
import { getDefaultProps } from '@/lib/registries'
import moduleClasses from './Footer.module.scss'
import type { ReactNode } from 'react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

const BOOLEAN_OPTIONS = [true, false] as const

const Group = ({ label, children }: { label: string, children: ReactNode }) => (
	<div style={ { display: 'flex', flexDirection: 'column', gap: 8, width: '100%' } }>
		<span style={ { font: 'var(--inkq-text-control)', letterSpacing: '.15em', textTransform: 'uppercase', opacity: 0.6 } }>
			{ label }
		</span>
		{ children }
	</div>
)

// `Footer`'s root class has its own SCSS declaration (`.inkq-footer {
// background-color: ...; position: relative; ... }`), so this literal,
// always-present class name is a stable selector for reaching the root
// element (which is also the polymorphic `as` target) regardless of state.
const ROOT_SELECTOR = '.inkq-footer'

// `Footer.Props` (the `declare namespace` export) is the raw, EMPTY
// `FooterProps` interface — `interface FooterProps {}`. `Footer` has no own
// props at all; everything a story can meaningfully set (`as`, `unstyled`,
// `children`, `attributes`, ...) comes from the `PolymorphicProps` wrapper.
// `Parameters<typeof Footer>[0]` reads that real, wrapped type straight off
// the component itself — the generic call signature's default `C` resolves
// to `'footer'` here, since `FooterSpecs`'s `defaults.as` is `'footer'`
// (`Footer.tsx`'s `DEFAULT_TAG`), matching `Footer.setDefaults({ props: {
// as: DEFAULT_TAG } })`.
type FooterStoryProps = Parameters<typeof Footer>[0]
type Story = StoryObj<FooterStoryProps>

const meta: Meta<FooterStoryProps> = {
	component: Footer,
	title: 'Navigation/Footer',
	parameters: { layout: 'padded' },
	argTypes: {
		unstyled: {
			control: 'boolean',
			description: 'Part of `PolymorphicProps` (via the shared `SpecsContract`), not `Footer`\'s own `FooterProps` (which declares no props at all). The semantic base class is ALWAYS emitted regardless of this prop — see the `Unstyled` story.',
		},
	},
	args: {
		...getDefaultProps<Footer.Props>('Footer'),
	},
}

export default meta

// `Footer` renders only hardcoded placeholder markup ("logo here",
// "navitems" x2, the tagline, and the © line) — there is no `children` prop
// on `FooterProps` to vary, so this is the only meaningfully distinct
// "content" story.
export const Default: Story = {}

export const AsElement: Story = {
	render: (args) => (
		<div style={ { display: 'flex', flexDirection: 'column', gap: 24 } }>
			<Group label='as="footer" (default)'>
				<Footer { ...args } />
			</Group>
			<Group label='as="div"'>
				<Footer { ...args } as="div" />
			</Group>
		</div>
	),
	play: async ({ canvasElement }) => {
		const roots = canvasElement.querySelectorAll(ROOT_SELECTOR)

		await expect(roots).toHaveLength(2)

		const [asFooter, asDiv] = Array.from(roots) as HTMLElement[]

		await expect(asFooter.tagName).toBe('FOOTER')
		await expect(asDiv.tagName).toBe('DIV')
	},
}

// `unstyled` does NOT remove `Footer`'s own semantic base classes
// (`inkq-footer`, `inkq-footer__main`, `inkq-footer__copyright`,
// `inkq-footer__wrapper`) — the base class is always emitted regardless of
// `unstyled`; only the CSS-module-hashed class normally appended alongside
// it is suppressed, and only where a hash exists to suppress in the first
// place (verified against the live `Footer.module.scss`).
export const Unstyled: Story = {
	parameters: { controls: { exclude: ['unstyled'] } },
	render: (args) => (
		<div style={ { display: 'flex', flexDirection: 'column', gap: 24 } }>
			{ BOOLEAN_OPTIONS.map(unstyled => (
				<Group key={ String(unstyled) } label={ String(unstyled) }>
					<Footer { ...args } unstyled={ unstyled } />
				</Group>
			)) }
		</div>
	),
	play: async ({ canvasElement }) => {
		const roots = canvasElement.querySelectorAll(ROOT_SELECTOR)

		await expect(roots).toHaveLength(2)

		// `BOOLEAN_OPTIONS` is `[true, false]`, so the FIRST rendered group is
		// `unstyled` and the SECOND is styled — matches the render order above.
		const [unstyledRoot, styledRoot] = Array.from(roots) as HTMLElement[]

		// Detect the REAL compiled CSS-module hash, keyed off the actual
		// `Footer.module.scss` export map — not a naive "any extra class"
		// heuristic (`getConfigClasses` in `getClassName.tsx` emits
		// modifier/global classes regardless of `unstyled`, so "any class
		// beyond the base" is a false positive).
		const hasModuleClass = (el: Element, base: string) => {
			const moduleClass = (moduleClasses as Record<string, string>)[base]
			return !!moduleClass && el.classList.contains(moduleClass)
		}

		await expect(styledRoot).toHaveClass('inkq-footer')
		await expect(unstyledRoot).toHaveClass('inkq-footer')
		expect(hasModuleClass(styledRoot, 'inkq-footer')).toBe(true)
		expect(hasModuleClass(unstyledRoot, 'inkq-footer')).toBe(false)

		const styledMain = styledRoot.querySelector('.inkq-footer__main') as HTMLElement,
			unstyledMain = unstyledRoot.querySelector('.inkq-footer__main') as HTMLElement

		await expect(styledMain).toHaveClass('inkq-footer__main')
		await expect(unstyledMain).toHaveClass('inkq-footer__main')
		expect(hasModuleClass(styledMain, 'inkq-footer__main')).toBe(true)
		expect(hasModuleClass(unstyledMain, 'inkq-footer__main')).toBe(false)

		const styledCopyright = styledRoot.querySelector('.inkq-footer__copyright') as HTMLElement,
			unstyledCopyright = unstyledRoot.querySelector('.inkq-footer__copyright') as HTMLElement

		await expect(styledCopyright).toHaveClass('inkq-footer__copyright')
		await expect(unstyledCopyright).toHaveClass('inkq-footer__copyright')
		expect(hasModuleClass(styledCopyright, 'inkq-footer__copyright')).toBe(true)
		expect(hasModuleClass(unstyledCopyright, 'inkq-footer__copyright')).toBe(false)

		// `&__wrapper` only exists NESTED inside `&__main`/`&__copyright` in the
		// SCSS (`#{$name}__wrapper { display: grid; ... }`, compiling to a
		// descendant selector, never a standalone `.inkq-footer__wrapper` rule
		// on its own) — but CSS Modules still exports a hash for the literal
		// class token `inkq-footer__wrapper` wherever it's referenced, so this
		// selector behaves exactly like the others: real hash when styled,
		// suppressed when unstyled.
		const styledWrapper = styledMain.querySelector('.inkq-footer__wrapper') as HTMLElement,
			unstyledWrapper = unstyledMain.querySelector('.inkq-footer__wrapper') as HTMLElement

		await expect(styledWrapper).toHaveClass('inkq-footer__wrapper')
		await expect(unstyledWrapper).toHaveClass('inkq-footer__wrapper')
		expect(hasModuleClass(styledWrapper, 'inkq-footer__wrapper')).toBe(true)
		expect(hasModuleClass(unstyledWrapper, 'inkq-footer__wrapper')).toBe(false)

		// **Source quirk, verified against the live `Footer.module.scss`**:
		// `Footer.tsx` calls `styles('col')`, which computes the base class
		// `inkq-footer__col` (double underscore, component-qualified) — but the
		// SCSS only declares a DIFFERENT, unrelated top-level selector,
		// `.inkq-footer-col` (single hyphen, not nested under `.inkq-footer` at
		// all). These are two different literal strings, so `getStyleClass()`
		// finds no compiled hash for `inkq-footer__col` under ANY state, and
		// `.inkq-footer-col` itself is never applied to any element `Footer.tsx`
		// renders. The base class is still emitted literally (unaffected by
		// `unstyled`), just never hashed — same class of bug as `Card`'s
		// `info`/`caption` selectors.
		const styledCol = styledRoot.querySelector('.inkq-footer__col') as HTMLElement,
			unstyledCol = unstyledRoot.querySelector('.inkq-footer__col') as HTMLElement

		await expect(styledCol).toHaveClass('inkq-footer__col')
		await expect(unstyledCol).toHaveClass('inkq-footer__col')
		expect(hasModuleClass(styledCol, 'inkq-footer__col')).toBe(false)
		expect(hasModuleClass(unstyledCol, 'inkq-footer__col')).toBe(false)
	},
}
