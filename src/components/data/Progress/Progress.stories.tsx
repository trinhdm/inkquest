import { useState } from 'react'
import { expect, userEvent, waitFor, within } from 'storybook/test'
import { getDefaultProps } from '@/hooks/useProps'
import { rem } from '@/lib/general'
import { Progress } from './Progress'
import type { ReactNode } from 'react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import moduleClasses from './Progress.module.scss'

// `Progress` has no enum or boolean props of its own (`height`/`width`/`max` are
// free-form), so there is no shared `options.story.ts`; the value lists below are
// local to this file.
const MAX_OPTIONS = [100, 50, 10] as const

const BOOLEAN_OPTIONS = [true, false] as const

// `height`/`width` accept a CSS string (kept verbatim) or a number (converted to
// rem by `tokens`). The first entry leaves both unset, so the registered defaults apply.
interface SizeOption {
	height?: Progress.Props['height']
	name: string
	width?: Progress.Props['width']
}

const SIZE_OPTIONS: readonly SizeOption[] = [
	{ name: 'defaults' },
	{ height: 8, name: 'numbers', width: 200 },
	{ height: '1rem', name: 'strings', width: '50%' },
]

// What lands in the inline custom properties. Computed at call time: `rem()` reads
// the live root font size.
const expectedSize = ({ height = '3px', width = '100%' }: SizeOption) => ({
	height: typeof height === 'number' ? rem(height) : height,
	width: typeof width === 'number' ? rem(width) : width,
})

// The bar is `position: fixed` and mirrors the WINDOW's scroll (it reads
// `document.documentElement`), so every scroll story needs a page taller than the
// viewport.
const PAGE_HEIGHT = 3000

const Row = ({ children }: { children: ReactNode }) => (
	<div style={ { display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'flex-start' } }>
		{ children }
	</div>
)

const Group = ({ label, children }: { label: string, children: ReactNode }) => (
	<div style={ { display: 'flex', flexDirection: 'column', gap: 8 } }>
		<span style={ { font: 'var(--inkq-text-control)', letterSpacing: '.15em', textTransform: 'uppercase', opacity: 0.6 } }>
			{ label }
		</span>
		{ children }
	</div>
)

// A `transform` makes this box the containing block of its `position: fixed`
// descendants, so a bar rendered inside it sits in the frame instead of stacking
// on top of the other bars at the viewport's top edge. It still reads the window's
// scroll position.
const Frame = ({ children }: { children: ReactNode }) => (
	<div style={ { height: 24, outline: '1px dashed currentColor', position: 'relative', transform: 'translateZ(0)', width: 320 } }>
		{ children }
	</div>
)

const Page = ({ children }: { children: ReactNode }) => (
	<div style={ { minHeight: PAGE_HEIGHT } }>
		{ children }
		<p style={ { paddingBlockStart: 48 } }>Scroll down: the page is {PAGE_HEIGHT}px tall.</p>
	</div>
)

const scrollRange = () => {
	const { clientHeight, scrollHeight } = document.documentElement
	return scrollHeight - clientHeight
}

// The browser delivers the native `scroll` event on its own rendering schedule,
// which the test iframe can delay past `waitFor`'s timeout. Firing one directly
// keeps the checks independent of that; the handler only reads the position.
const scrollToTop = (top: number) => {
	window.scrollTo({ behavior: 'instant', top })
	window.dispatchEvent(new Event('scroll'))
}

// Mirrors the formula in `Progress.tsx`'s `updateProgress`, from the live geometry.
const expectedValue = (max: number) => {
	const { clientHeight, scrollHeight, scrollTop } = document.documentElement,
		range = scrollHeight - clientHeight,
		percent = range > 0 ? Math.round((scrollTop / range) * 100) : 0

	return percent * (max / 100)
}

// `Parameters<typeof Progress>[0]` reads the real, wrapped prop type off the
// component itself (it includes `as`, `unstyled`, ...). It fills the polymorphic
// `C` with its constraint (`ElementType`), not the default `'progress'`.
type ProgressStoryProps = Parameters<typeof Progress>[0]
type Story = StoryObj<ProgressStoryProps>

const meta: Meta<ProgressStoryProps> = {
	component: Progress,
	title: 'Data/Progress',
	argTypes: {
		as: {
			control: false,
			description: 'Polymorphic escape hatch via the shared `Box` contract; the registered default is the native `progress`. Anything else loses `max`/`value` semantics, so no story overrides it.',
		},
		height: {
			control: 'text',
			description: 'A CSS string (kept verbatim) or a number (converted to rem). Becomes the inline `--progress-bar-height` custom property; it is NOT reflected as a DOM `height` attribute. Registered default is `3px`. See the `Size` story.',
		},
		id: {
			control: 'text',
			description: 'Optional. Used for both the bar\'s `id` and the label\'s `htmlFor`; when omitted a `useId()` value is used instead, so two bars on one page never share an id. See the `Id` story.',
		},
		label: {
			control: 'text',
			description: 'Required. Rendered in a screen-reader-only `<label>` tied to the bar by `htmlFor`/`id`, which is the bar\'s accessible name. See the `Default` story.',
		},
		max: {
			control: 'number',
			description: 'Forwarded to the element as `max`. The scroll percentage is scaled to it (`percent * max / 100`), and the scroll effect re-subscribes when it changes. Registered default is `100`. See the `Max` and `MaxChange` stories.',
		},
		width: {
			control: 'text',
			description: 'A CSS string (kept verbatim) or a number (converted to rem). Becomes the inline `--progress-bar-width` custom property; it is NOT reflected as a DOM `width` attribute. Registered default is `100%`. See the `Size` story.',
		},
		unstyled: {
			control: 'boolean',
			description: 'Part of the factory\'s `FactoryContract`, not `Progress`\'s own props. Drops the CSS-module hash from the bar; the semantic base class (`inkq-progress`) stays. See the `Unstyled` story.',
		},
	},
	args: {
		...getDefaultProps<Progress.Props>('Progress'),
		label: 'Reading progress',
	},
	parameters: { layout: 'padded' },
	// Scroll position survives from one story to the next, and the bar reads it on mount.
	beforeEach: () => {
		scrollToTop(0)
	},
}

export default meta

/**
 * A native `<progress>` with a screen-reader-only `<label>`: the label is tied to
 * the bar by `htmlFor`/`id` and is its accessible name. Unscrolled, the bar is
 * empty. The bar is fixed to the top edge of the viewport.
 */
export const Default: Story = {
	render: (args) => (
		<Page>
			<Progress { ...args } />
		</Page>
	),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement),
			bar = canvas.getByRole('progressbar') as HTMLProgressElement

		await expect(bar.tagName).toBe('PROGRESS')
		await expect(bar).toHaveAttribute('max', '100')
		await expect(bar.value).toBe(0)

		// The label is wired to the bar both ways.
		await expect(canvas.getByLabelText('Reading progress')).toBe(bar)
		await expect(canvas.getByText('Reading progress')).toHaveAttribute('for', bar.id)
		await expect(bar.id).not.toBe('')
		await expect(bar).toHaveAccessibleName('Reading progress')
	},
}

/**
 * The bar measures the WINDOW (`document.documentElement`), not a container: it
 * listens for `scroll` on `window` and writes `value` inside a
 * `requestAnimationFrame`, so every assertion after a scroll waits for it. The
 * percentage is rounded to a whole number.
 */
export const ScrollTracking: Story = {
	render: (args) => (
		<Page>
			<Progress { ...args } />
		</Page>
	),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement),
			bar = canvas.getByRole('progressbar') as HTMLProgressElement

		await expect(scrollRange()).toBeGreaterThan(0)
		await expect(bar.value).toBe(0)

		// Halfway down.
		scrollToTop(scrollRange() / 2)
		await waitFor(() => expect(bar.value).toBe(expectedValue(100)))
		await expect(Math.abs(bar.value - 50)).toBeLessThanOrEqual(1)

		// All the way down.
		scrollToTop(scrollRange())
		await waitFor(() => expect(bar.value).toBe(100))

		// And back to the top.
		scrollToTop(0)
		await waitFor(() => expect(bar.value).toBe(0))
	},
}

/**
 * `max` scales the value: at the bottom of the page every bar is full (`value ===
 * max`), halfway down each is at half of its own `max`. Each bar is held in a
 * frame so the three do not stack on the viewport's top edge.
 */
export const Max: Story = {
	parameters: { controls: { exclude: ['max', 'label'] } },
	render: (args) => (
		<Page>
			<Row>
				{ MAX_OPTIONS.map(max => (
					<Group key={ max } label={ `max: ${max}` }>
						<Frame>
							<Progress { ...args } label={ `Max ${max}` } max={ max } />
						</Frame>
					</Group>
				)) }
			</Row>
		</Page>
	),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement)

		const barFor = (max: number) =>
			canvas.getByRole('progressbar', { name: `Max ${max}` }) as HTMLProgressElement

		for (const max of MAX_OPTIONS) {
			await expect(barFor(max)).toHaveAttribute('max', String(max))
			await expect(barFor(max).max).toBe(max)
			await expect(barFor(max).value).toBe(0)
		}

		scrollToTop(scrollRange() / 2)
		for (const max of MAX_OPTIONS)
			await waitFor(() => expect(barFor(max).value).toBe(expectedValue(max)))

		scrollToTop(scrollRange())
		for (const max of MAX_OPTIONS)
			await waitFor(() => expect(barFor(max).value).toBe(max))
	},
}

// Owns the `max` state and a re-render counter, with the controls fixed to the
// viewport so they stay reachable at any scroll position.
const StatefulProgress = (args: ProgressStoryProps) => {
	const [count, setCount] = useState(0),
		[max, setMax] = useState(100)

	return (
		<Page>
			<Progress { ...args } max={ max } />

			<div style={ { bottom: 16, display: 'flex', gap: 8, position: 'fixed', right: 16 } }>
				<button type="button" onClick={ () => setMax(20) }>Set max 20</button>
				<button type="button" onClick={ () => setMax(100) }>Set max 100</button>
				<button type="button" onClick={ () => setCount(c => c + 1) }>Re-render</button>
				<output aria-label="Render count">{ count }</output>
			</div>
		</Page>
	)
}

/**
 * Changing `max` while the page is scrolled: the effect depends on `max`, so it
 * re-runs, reads the scroll position straight away and re-scales `value` to the
 * new `max` without waiting for another scroll event.
 */
export const MaxChange: Story = {
	parameters: { controls: { exclude: /.*/ } },
	render: (args) => <StatefulProgress { ...args } />,
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement),
			bar = canvas.getByRole('progressbar') as HTMLProgressElement

		scrollToTop(scrollRange())
		await waitFor(() => expect(bar.value).toBe(100))
		await expect(bar.max).toBe(100)

		await userEvent.click(canvas.getByRole('button', { name: 'Set max 20' }))
		await waitFor(() => expect(bar.max).toBe(20))
		await waitFor(() => expect(bar.value).toBe(20))

		await userEvent.click(canvas.getByRole('button', { name: 'Set max 100' }))
		await waitFor(() => expect(bar.max).toBe(100))
		await waitFor(() => expect(bar.value).toBe(100))

		scrollToTop(0)
		await waitFor(() => expect(bar.value).toBe(0))
	},
}

/**
 * A parent re-render that does not change any `Progress` prop must not reset the
 * bar: it is the same DOM node and keeps the `value` the scroll handler wrote
 * (the markup renders `value={ 0 }`, which React does not re-apply when the prop
 * is unchanged).
 */
export const Rerender: Story = {
	parameters: { controls: { exclude: /.*/ } },
	render: (args) => <StatefulProgress { ...args } />,
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement),
			bar = canvas.getByRole('progressbar') as HTMLProgressElement

		scrollToTop(scrollRange() / 2)
		await waitFor(() => expect(bar.value).toBe(expectedValue(100)))

		const before = bar.value
		await expect(before).toBeGreaterThan(0)

		const rerender = canvas.getByRole('button', { name: 'Re-render' })

		await userEvent.click(rerender)
		await userEvent.click(rerender)
		await waitFor(() => expect(canvas.getByLabelText('Render count')).toHaveTextContent('2'))

		await expect(canvas.getByRole('progressbar')).toBe(bar)
		await expect(bar.value).toBe(before)
		await expect(bar.max).toBe(100)

		scrollToTop(0)
		await waitFor(() => expect(bar.value).toBe(0))
	},
}

/**
 * `height` and `width` become the inline `--progress-bar-height` /
 * `--progress-bar-width` custom properties: strings verbatim, numbers converted to
 * rem. Neither is reflected as a DOM attribute.
 */
export const Size: Story = {
	parameters: { controls: { exclude: ['height', 'width', 'label'] } },
	render: (args) => (
		<Row>
			{ SIZE_OPTIONS.map(({ name, ...size }) => (
				<Group key={ name } label={ name }>
					<Frame>
						{ /* sizes left out entirely, so the registered defaults apply */ }
						<Progress { ...args } { ...size } label={ `Size ${name}` } />
					</Frame>
				</Group>
			)) }
		</Row>
	),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement)

		for (const option of SIZE_OPTIONS) {
			const bar = canvas.getByRole('progressbar', { name: `Size ${option.name}` }),
				expected = expectedSize(option)

			await expect(bar.style.getPropertyValue('--progress-bar-height')).toBe(expected.height)
			await expect(bar.style.getPropertyValue('--progress-bar-width')).toBe(expected.width)
			await expect(bar).not.toHaveAttribute('height')
			await expect(bar).not.toHaveAttribute('width')
		}
	},
}

/**
 * Without an `id` the bar and label share a generated one, so two bars on one page
 * never collide; a supplied `id` is used for both the bar and the label's `for`.
 */
export const Id: Story = {
	parameters: { controls: { exclude: ['id', 'label'] } },
	render: (args) => (
		<Row>
			<Group label="id: 'page-progress'">
				<Frame><Progress { ...args } id="page-progress" label="Explicit id" /></Frame>
			</Group>
			<Group label="id: undefined (first)">
				<Frame><Progress { ...args } id={ undefined } label="Generated first" /></Frame>
			</Group>
			<Group label="id: undefined (second)">
				<Frame><Progress { ...args } id={ undefined } label="Generated second" /></Frame>
			</Group>
		</Row>
	),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement)

		const explicit = canvas.getByRole('progressbar', { name: 'Explicit id' }),
			first = canvas.getByRole('progressbar', { name: 'Generated first' }),
			second = canvas.getByRole('progressbar', { name: 'Generated second' })

		await expect(explicit).toHaveAttribute('id', 'page-progress')
		await expect(canvas.getByText('Explicit id')).toHaveAttribute('for', 'page-progress')

		await expect(first.id).not.toBe('')
		await expect(second.id).not.toBe('')
		await expect(first.id).not.toBe(second.id)
		await expect(canvas.getByLabelText('Generated first')).toBe(first)
		await expect(canvas.getByLabelText('Generated second')).toBe(second)
	},
}

/**
 * `unstyled` keeps the semantic base class (`inkq-progress`) but drops the
 * CSS-module hash.
 */
export const Unstyled: Story = {
	parameters: { controls: { exclude: ['unstyled', 'label'] } },
	render: (args) => (
		<Row>
			{ BOOLEAN_OPTIONS.map(unstyled => (
				<Group key={ String(unstyled) } label={ String(unstyled) }>
					<Frame>
						<Progress { ...args } label={ `Unstyled ${unstyled}` } unstyled={ unstyled } />
					</Frame>
				</Group>
			)) }
		</Row>
	),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement),
			unstyledBar = canvas.getByRole('progressbar', { name: 'Unstyled true' }),
			styledBar = canvas.getByRole('progressbar', { name: 'Unstyled false' })

		const hasModuleClass = (el: Element, base: string) => {
			const moduleClass = (moduleClasses as Record<string, string>)[base]
			return !!moduleClass && el.classList.contains(moduleClass)
		}

		await expect(styledBar).toHaveClass('inkq-progress')
		await expect(unstyledBar).toHaveClass('inkq-progress')
		expect(hasModuleClass(styledBar, 'inkq-progress')).toBe(true)
		expect(hasModuleClass(unstyledBar, 'inkq-progress')).toBe(false)
	},
}
