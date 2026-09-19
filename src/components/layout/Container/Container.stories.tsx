import { expect, within } from 'storybook/test'
import { getDefaultProps } from '@/hooks/useProps'
import { Container } from './Container'
import type { ReactNode } from 'react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import moduleClasses from './Container.module.scss'

// `Container` has no enum-valued props of its own (just `children` and
// `fullWidth`, plus the polymorphic `as`/Box escape hatches), so — same as
// `Badge` — these stay local instead of living in a shared `options.story.ts`.
const BOOLEAN_OPTIONS = [true, false] as const

const Row = ({ children }: { children: ReactNode }) => (
	<div style={ { display: 'flex', gap: 24, flexWrap: 'wrap' } }>
		{ children }
	</div>
)

const Group = ({ label, children }: { label: string, children: ReactNode }) => (
	<div style={ { display: 'flex', flexDirection: 'column', gap: 8 } }>
		<span style={ { font: 'var(--inkq-text-control)', letterSpacing: '.15em', textTransform: 'uppercase', opacity: 0.6 } }>
			{ label }
		</span>
		<div style={ { display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' } }>
			{ children }
		</div>
	</div>
)

// `Container` renders its own root class unconditionally (`getClassName`
// always pushes the kebab-cased, prefixed base class — `inkq-container` —
// onto the root element's `className` before any CSS-module hash is mixed
// in; see `useStyles/getClassName.tsx`). Unlike `Badge`, `Container` has no
// `data-variant` attribute to key off of, so this literal class name is the
// stable selector used below to walk from the rendered text (which lives one
// level down, inside the internal `<Box>` wrapper — a plain `div`, same as
// the root) back up to the actual polymorphic root element.
const ROOT_SELECTOR = '.inkq-container'

// `Container.Props` (the `declare namespace` export) is just the raw
// `ContainerProps` interface — it doesn't include `as`/`unstyled`/
// `attributes`/etc., which only exist on the actual accepted prop type,
// `PolymorphicProps<ContainerProps, C>`. `Parameters<typeof Container>[0]`
// reads that real, wrapped type straight off the component itself — the
// generic call signature's default `C` resolves to `'section'` here, since
// `ContainerSpecs`'s `defaults.as` is `'section'` (`Container.tsx`'s
// `DEFAULT_TAG`), and `Container.setDefaults({ props: { as: DEFAULT_TAG } })`
// registers that same `'section'` as the actual runtime default — so
// `meta.args` (via `getDefaultProps`) already carries `as: 'section'` before
// any story overrides it. See the `AsElement` story.
type ContainerStoryProps = Parameters<typeof Container>[0]
type Story = StoryObj<ContainerStoryProps>

const meta: Meta<ContainerStoryProps> = {
	component: Container,
	title: 'Layout/Container',
	argTypes: {
		children: { control: 'text' },
		fullWidth: {
			control: 'boolean',
			description: 'Stretches the container to fill its parent\'s width (adds `data-block`/`display: block; width: 100%`).',
		},
		revealed: {
			control: 'boolean',
			description: '**Probable source bug, verified against the live `Container.tsx`**: declared on `ContainerProps` but never destructured or read anywhere in the component body — it falls straight through `extractOtherProps(rest)`\'s `others` and lands as a raw, unrecognized DOM attribute on the rendered root element. It has no visual or behavioral effect of any kind (no class, no style, no `data-*` attribute), so no story exercises it beyond this doc note — asserting "meaningful" `revealed` behavior here would document something the component doesn\'t actually do.',
		},
		unstyled: {
			control: 'boolean',
			description: 'Part of `PolymorphicProps` (via the shared `SpecsContract`), not `Container`\'s own `ContainerProps`. The semantic base class (`inkq-container` on the root, `inkq-container__wrapper` on the inner `<div>`) is ALWAYS emitted regardless of this prop. **Source quirk, verified against `Container.module.scss`**: `.inkq-container` (the root selector) has NO declarations of its own — only a nested `&__wrapper` rule — so CSS Modules exports no hashed class for the root at all; `getStyleClass()` (`getClassName.tsx`) finds no matching key in the compiled `classes` map and returns `undefined` regardless of `unstyled`. The root therefore NEVER carries a module hash, styled or unstyled — only the semantic base class. The inner `<div>` (`&__wrapper`) DOES have its own declaration, so it behaves as originally documented: a real CSS-module hash is appended when styled and suppressed when `unstyled`. See the `Unstyled` story.',
		},
	},
	args: {
		...getDefaultProps<Container.Props>('Container'),
		children: 'Container content',
	},
}

export default meta

export const Default: Story = {}

export const FullWidth: Story = {
	parameters: {
		layout: 'padded',
		controls: { exclude: ['fullWidth'] },
	},
	render: (args) => (
		<div style={ { display: 'flex', flexDirection: 'column', gap: 24 } }>
			{ BOOLEAN_OPTIONS.map(fullWidth => (
				<Group key={ String(fullWidth) } label={ String(fullWidth) }>
					<Container { ...args as ContainerStoryProps } fullWidth={ fullWidth } />
				</Group>
			)) }
		</div>
	),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement),
			items = canvas.getAllByText('Container content')

		await expect(items).toHaveLength(2)

		// `fullWidth` maps to a `data-block` attribute on the root element (see
		// `Container.tsx`'s `data={ { block: !!fullWidth || null } }`, which
		// `filterProps` only keeps when truthy) — the text sits one level down
		// inside the internal `<Box>` wrapper, so walk up to the root.
		const [isFullWidth, isNotFullWidth] = items.map(
			item => item.closest(ROOT_SELECTOR) as HTMLElement
		)

		await expect(isFullWidth).toHaveAttribute('data-block')
		await expect(isNotFullWidth).not.toHaveAttribute('data-block')
	},
}

export const AsElement: Story = {
	parameters: { layout: 'padded' },
	render: (args) => (
		<Row>
			<Group label='as="section" (default)'>
				<Container { ...args as ContainerStoryProps } />
			</Group>
			<Group label='as="div"'>
				<Container { ...args as ContainerStoryProps } as="div" />
			</Group>
		</Row>
	),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement),
			items = canvas.getAllByText('Container content')

		await expect(items).toHaveLength(2)

		const [asSection, asDiv] = items.map(
			item => item.closest(ROOT_SELECTOR) as HTMLElement
		)

		// `meta.args` already carries the REGISTERED default (`as: 'section'`,
		// via `getDefaultProps`/`Container.setDefaults`) — leaving `as`
		// unset here renders `section`, not `div`.
		await expect(asSection.tagName).toBe('SECTION')
		await expect(asDiv.tagName).toBe('DIV')
	},
}

export const NestedContent: Story = {
	args: {
		children: (
			<div style={ { display: 'flex', flexDirection: 'column', gap: 12, width: '100%' } }>
				<div style={ { padding: 16, background: 'var(--inkq-background-page)', border: '1px dashed currentColor' } }>
					Block one
				</div>
				<div style={ { padding: 16, background: 'var(--inkq-background-page)', border: '1px dashed currentColor' } }>
					Block two
				</div>
			</div>
		),
	},
	parameters: { layout: 'padded' },
}

// `unstyled` does NOT remove the base `inkq-container`/`inkq-container__wrapper`
// classes `useStyles`/`getClassName.tsx` applies to the root and inner
// wrapper elements — per `getClassName.tsx`, the base class is now ALWAYS
// emitted (`classList = [baseClass]` unconditionally). It only suppresses the
// CSS-module-hashed class normally appended alongside it — and only where a
// hashed class exists to suppress in the first place.
//
// **Re-verified against the LIVE `Container.tsx`/`Container.module.scss`**:
// the root selector, `.inkq-container`, has NO declarations of its own in the
// SCSS — only a nested `&__wrapper` rule — so CSS Modules never compiles a
// hash for the `inkq-container` key at all. `getStyleClass()` looks up that
// exact key in the compiled `classes` map and finds nothing, so it returns
// `undefined` regardless of `unstyled`: the ROOT never carries a module hash,
// styled or unstyled alike. The inner wrapper (`&__wrapper`, matching
// `Container.tsx`'s `styles('wrapper')` call) DOES have its own declaration,
// so it behaves as originally expected: a real CSS-module hash is appended
// when styled and suppressed when `unstyled`. The two elements are NOT
// symmetric — assert on the real, compiled `classes` map below rather than a
// naive "any class beyond the base" heuristic, which would incorrectly
// pass/fail depending on unrelated config/global classes and can't tell a
// genuine module hash apart from anything else.
export const Unstyled: Story = {
	parameters: {
		layout: 'padded',
		controls: { exclude: ['unstyled'] },
	},
	render: (args) => (
		<Row>
			{ BOOLEAN_OPTIONS.map(unstyled => (
				<Group key={ String(unstyled) } label={ String(unstyled) }>
					<Container { ...args as ContainerStoryProps } unstyled={ unstyled } />
				</Group>
			)) }
		</Row>
	),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement),
			items = canvas.getAllByText('Container content')

		await expect(items).toHaveLength(2)

		// `ROOT_SELECTOR` (`.inkq-container`) reliably reaches the root in BOTH
		// groups now, since the base class is never stripped by `unstyled`
		// (unlike before this change, when it had to be reached via
		// `parentElement` for the unstyled instance).
		const [unstyledRoot, styledRoot] = items.map(
			item => item.closest(ROOT_SELECTOR) as HTMLElement
		)
		const [unstyledInner, styledInner] = items

		// Detect the REAL compiled CSS-module hash, keyed off the actual
		// `Container.module.scss` export map — not a naive "any extra class"
		// heuristic, which can't distinguish a module hash from an unrelated
		// config/global modifier class (and which would also be wrong here,
		// since the root has no compiled hash to find at all).
		const hasModuleClass = (el: Element, base: string) => {
			const moduleClass = (moduleClasses as Record<string, string>)[base]
			return !!moduleClass && el.classList.contains(moduleClass)
		}

		await expect(styledRoot).toHaveClass('inkq-container')
		await expect(unstyledRoot).toHaveClass('inkq-container')
		// `.inkq-container` has no own SCSS declaration — only the nested
		// `&__wrapper` rule — so CSS Modules compiles no hash for it at all.
		// The root NEVER carries a module-hashed class, styled or unstyled.
		expect(hasModuleClass(styledRoot, 'inkq-container')).toBe(false)
		expect(hasModuleClass(unstyledRoot, 'inkq-container')).toBe(false)

		// The wrapper DOES have its own SCSS declaration (`&__wrapper`,
		// matching `styles('wrapper')`'s computed base class exactly), so a
		// CSS-module hash is genuinely appended when styled and suppressed
		// when `unstyled`.
		await expect(styledInner).toHaveClass('inkq-container__wrapper')
		await expect(unstyledInner).toHaveClass('inkq-container__wrapper')
		expect(hasModuleClass(styledInner, 'inkq-container__wrapper')).toBe(true)
		expect(hasModuleClass(unstyledInner, 'inkq-container__wrapper')).toBe(false)
	},
}
