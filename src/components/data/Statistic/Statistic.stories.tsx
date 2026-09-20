import { expect, within } from 'storybook/test'
import { getDefaultProps } from '@/hooks/useProps'
import { Icon } from '@/components/core/Icon'
import { Statistic } from './Statistic'
import { BOOLEAN_OPTIONS, ORDER_OPTIONS, SIZE_OPTIONS } from './options.story'
import type { ReactNode } from 'react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import moduleClasses from './Statistic.module.scss'

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

// `Statistic.Props` (the `declare namespace` export) is just the raw
// `StatisticProps` interface — it doesn't include `as`/`unstyled`/
// `attributes`/etc., which only exist on the actual accepted prop type,
// `PolymorphicProps<StatisticProps, C>`. `Parameters<typeof Statistic>[0]`
// reads that real, wrapped type straight off the component itself.
type StatisticStoryProps = Parameters<typeof Statistic>[0]
type Story = StoryObj<StatisticStoryProps>

const hasModuleClass = (el: Element, base: string) => {
	const moduleClass = (moduleClasses as Record<string, string>)[base]
	return !!moduleClass && el.classList.contains(moduleClass)
}

const meta: Meta<StatisticStoryProps> = {
	component: Statistic,
	title: 'Data/Statistic',
	argTypes: {
		value: {
			control: 'text',
			description: 'Required, `number | string`. `useCountUp` stringifies whichever is passed (`String(value)`) and runs it through the SAME `VALUE_PATTERN` regex either way — a `number` and a numeric-LOOKING string (e.g. `\'$9.2M\'`, `\'12,400+\'`) both animate identically, preserving any prefix/suffix/decimals/comma-grouping. Only a string with NO parseable numeric core (e.g. `\'—\'`, `\'N/A\'`) falls back to `parsed === null`, which is treated as fully static: it renders immediately and never animates, regardless of `animated`/`duration`. See the `ValueTypes` story for all three cases side-by-side.',
		},
		animated: {
			control: 'boolean',
			description: 'Drives `useCountUp`\'s `enabled` option. When `false` (or when `prefers-reduced-motion` is on), the displayed value is set to its final formatted form SYNCHRONOUSLY on mount — no animation frame at all — so stories asserting a specific rendered value should generally use `animated: false` for determinism. See the `AnimatedState` story for the `true` branch, exercised with a short explicit `duration` and `waitFor`-style querying rather than asserting mid-animation.',
		},
		duration: {
			control: 'number',
			description: 'Milliseconds, fed straight into `useCountUp`\'s `animate()` call (divided by 1000 for `framer-motion`\'s seconds-based `duration`). Registered default is `3000` — deliberately overridden to a short value in the `AnimatedState` story so the `play` function doesn\'t need a multi-second timeout.',
		},
		highlight: {
			control: 'boolean',
			description: 'A `global`-scope config class (`global = { highlight, item: true }`, not a `module`-scope one) — per `getClassName.tsx`, this always emits as a literal, unhashed `inkq-highlight` class (no matching rule in `Statistic.module.scss` to hash against), independent of `unstyled`. The same `global` config also unconditionally includes `item: true`, which likewise always emits a literal `inkq-item` class regardless of `highlight`. See the `Highlight` story.',
		},
		icon: {
			control: false,
			description: 'Arbitrary `ReactNode`, rendered directly inside `.inkq-statistic__inner`, immediately before the counted value `<span>`. See the `Icon` story for presence vs. absence.',
		},
		caption: {
			control: 'text',
			description: 'Same pattern as `Quote`\'s `author` — the caption `<span>` (`styles(\'caption\', true)`) renders UNCONDITIONALLY, even with `caption` omitted, producing an empty (but present) element. `Statistic.module.scss` also has no `&__caption` declaration at all, so this selector never carries a CSS-module hash, styled or unstyled — only the semantic base class plus the `inkq-caption` literal utility class from the `true` boolean-shorthand config. See the `Caption` story.',
		},
		order: {
			control: 'select',
			options: ORDER_OPTIONS,
			description: 'Registered default `\'descend\'` (`Statistic.setDefaults({ props: DEFAULT_PROPS })`). Drives `setThemeCSS`\'s `tokens.root` — `\'descend\'` sets `--statistic-align: flex-start` and `--statistic-direction: column`; any other value (i.e. `\'ascend\'`) flips to `--statistic-align: flex-end` and `--statistic-direction: column-reverse`. Also inherited from a wrapping `Statistic.Group` via `useStatisticGroupProps` when this `Statistic`\'s own prop is absent. See the `Order` story.',
		},
		size: {
			control: 'select',
			options: SIZE_OPTIONS,
			description: 'Registered default `\'lg\'` (`Statistic.setDefaults({ props: DEFAULT_PROPS })`). Drives BOTH a `module`-scope config class (`inkq-statistic--sm`/`inkq-statistic--lg`, hashed — each has a real `&--sm`/`&--lg` declaration in `Statistic.module.scss`) AND `setThemeCSS`\'s `tokens.root` (`--statistic-font-caption`, `--statistic-font-value`, and — indirectly, via which title tag `Statistic.Group` renders for a section — the surrounding heading level). Also inherited from a wrapping `Statistic.Group` via `useStatisticGroupProps` when this `Statistic`\'s own prop is absent. See the `Size` story.',
		},
		index: {
			control: 'number',
			description: 'Combines with `stagger` as `delay: index * stagger` fed into `useCountUp`. Registered default `0` (`Statistic.setDefaults({ props: DEFAULT_PROPS })`, not a local destructuring default in `Statistic.tsx`\'s own render). Standalone, this is mostly meaningful when a parent `Statistic.Group` assigns it automatically per child — see `Statistic.Group`\'s `ContextPrecedence` story, which is where this is actually exercised end-to-end with real timing assertions (kept out of this file to avoid a second flaky multi-second `play` function for the same underlying mechanism).',
		},
		stagger: {
			control: 'number',
			description: 'See `index` above — registered default `0` (`Statistic.setDefaults({ props: DEFAULT_PROPS })`, not a local destructuring default).',
		},
		withinView: {
			control: 'boolean',
			description: 'Overrides `useCountUp`\'s internal `IntersectionObserver`-driven visibility check entirely (`viewable = withinView ?? inView`) — when explicitly a boolean, the real observer is never consulted (`observer = typeof withinView === \'boolean\' ? idle : node`, where `idle` is a ref that\'s never attached to anything). `true` forces the animation to run regardless of actual on-screen visibility; `false` permanently blocks it. See the `WithinView` story, which uses this to keep the assertions deterministic instead of depending on real viewport visibility timing.',
		},
		unstyled: {
			control: 'boolean',
			description: 'Part of `PolymorphicProps`, not `Statistic`\'s own `StatisticProps`. The semantic base class is ALWAYS emitted for `root`/`inner`/`value`/`caption` (`inkq-statistic`, `inkq-statistic__inner`, `inkq-statistic__value`, `inkq-statistic__caption`) regardless of this prop — `unstyled` only suppresses the CSS-module-hashed class normally appended alongside it, and only for selectors that actually have a hash to suppress. `root`, `inner`, and `value` each have a real declaration in `Statistic.module.scss` (`root` carries its own custom-property/layout rules directly, not just nested `&__...` rules), so their hash is genuinely suppressed when unstyled. `caption` (`&__caption`) has no own declaration — see the `caption` description above — and ALSO always carries the literal `inkq-caption` utility class from its `true` boolean-shorthand config (unaffected by `unstyled`, since only `getStyleClass` checks `check.isUnstyled` — never the boolean-config branch of `getConfigClasses`). See the `Unstyled` story.',
		},
	},
	args: {
		...getDefaultProps<Statistic.Props>('Statistic'),
		value: 1234,
		caption: 'Total signups',
		animated: false,
	},
}

export default meta

export const Default: Story = {
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement)

		await expect(canvas.getByText('1234')).toBeInTheDocument()
		await expect(canvas.getByText('Total signups')).toBeInTheDocument()
	},
}

// `animated: false` (this file's default) sets the final formatted value
// SYNCHRONOUSLY on mount — no animation, no timing dependency. `animated:
// true` genuinely animates via `framer-motion`'s `animate()`, so this group
// pins a short `duration` and forces `withinView: true` (bypassing the real
// `IntersectionObserver`) to keep the assertion both real AND fast.
export const AnimatedState: Story = {
	parameters: { controls: { exclude: ['animated'] } },
	render: (args) => (
		<Row>
			<Group label="true">
				<Statistic { ...args } animated duration={ 200 } withinView value={ 500 } />
			</Group>
			<Group label="false">
				<Statistic { ...args } animated={ false } value={ 750 } />
			</Group>
		</Row>
	),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement)

		// `animated: false` — already settled on mount. A different `value`
		// than the animated group's, so the two groups' displayed text never
		// collides mid-test (both eventually converge on their own distinct
		// final value, but never the SAME text at the same time).
		await expect(canvas.getByText('750')).toBeInTheDocument()

		// `animated: true` — starts at the formatted `start` value (`0`) and
		// counts up to `500` over `duration: 200`ms; `findByText` polls/waits
		// rather than asserting a mid-animation snapshot.
		await expect(await canvas.findByText('500', {}, { timeout: 3000 })).toBeInTheDocument()
	},
}

// Both a plain `number` and a numeric-LOOKING string animate/format
// identically; only a string with no parseable numeric core stays fully
// static (never animates, even with `animated` true).
export const ValueTypes: Story = {
	parameters: { controls: { exclude: ['value'] } },
	render: (args) => (
		<Row>
			<Group label="number (1234)">
				<Statistic { ...args } value={ 1234 } animated={ false } />
			</Group>
			<Group label="formatted string ($9.2M)">
				<Statistic { ...args } value="$9.2M" animated={ false } />
			</Group>
			<Group label="unparseable string (N/A)">
				<Statistic { ...args } value="N/A" animated />
			</Group>
		</Row>
	),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement)

		await expect(canvas.getByText('1234')).toBeInTheDocument()
		await expect(canvas.getByText('$9.2M')).toBeInTheDocument()
		// unparseable — renders the raw string immediately, `animated: true`
		// notwithstanding, since `useCountUp` never finds a numeric core to
		// count from/to.
		await expect(canvas.getByText('N/A')).toBeInTheDocument()
	},
}

export const Highlight: Story = {
	parameters: { controls: { exclude: ['highlight'] } },
	render: (args) => (
		<Row>
			{ BOOLEAN_OPTIONS.map(highlight => (
				<Group key={ String(highlight) } label={ String(highlight) }>
					<Statistic { ...args } highlight={ highlight } />
				</Group>
			)) }
		</Row>
	),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement),
			captions = canvas.getAllByText('Total signups')

		expect(captions).toHaveLength(2)

		const [isHighlighted, isNotHighlighted] = captions.map(
			caption => caption.closest('.inkq-statistic') as HTMLElement
		)

		// `item` is part of the same `global` config as `highlight` and is
		// unconditionally `true`, so `inkq-item` is present either way.
		await expect(isHighlighted).toHaveClass('inkq-highlight', 'inkq-item')
		await expect(isNotHighlighted).toHaveClass('inkq-item')
		await expect(isNotHighlighted).not.toHaveClass('inkq-highlight')
	},
}

export const Icon_: Story = {
	name: 'Icon',
	render: (args) => (
		<Row>
			<Group label="with icon">
				<Statistic { ...args } icon={ <Icon type="download" /> } />
			</Group>
			<Group label="without icon">
				<Statistic { ...args } />
			</Group>
		</Row>
	),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement),
			captions = canvas.getAllByText('Total signups')

		expect(captions).toHaveLength(2)

		const [withIcon, withoutIcon] = captions.map(
			caption => caption.closest('.inkq-statistic') as HTMLElement
		)

		await expect(withIcon.querySelector('.inkq-statistic__inner svg')).toBeInTheDocument()
		await expect(withoutIcon.querySelector('.inkq-statistic__inner svg')).not.toBeInTheDocument()
	},
}

// `caption` renders unconditionally (see the `caption` argType doc note) —
// "without caption" means an EMPTY, still-present element, not a missing one.
export const Caption: Story = {
	parameters: { controls: { exclude: ['caption'] } },
	render: (args) => (
		<Row>
			<Group label="with caption">
				<Statistic { ...args } caption="Total signups" />
			</Group>
			<Group label="without caption">
				<Statistic { ...args } caption={ undefined } />
			</Group>
		</Row>
	),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement),
			values = canvas.getAllByText('1234')

		expect(values).toHaveLength(2)

		const [withCaption, withoutCaption] = values.map(
			value => value.closest('.inkq-statistic') as HTMLElement
		)

		const withCaptionEl = withCaption.querySelector('.inkq-statistic__caption'),
			withoutCaptionEl = withoutCaption.querySelector('.inkq-statistic__caption')

		await expect(withCaptionEl).toHaveTextContent('Total signups')
		await expect(withoutCaptionEl).toBeInTheDocument()
		await expect(withoutCaptionEl).toHaveTextContent('')
	},
}

// Forcing `withinView` explicitly bypasses `useCountUp`'s real
// `IntersectionObserver` check entirely — `true` always animates, `false`
// never does, regardless of actual on-screen visibility.
export const WithinView: Story = {
	parameters: { controls: { exclude: ['withinView'] } },
	render: (args) => (
		<Row>
			<Group label="true">
				<Statistic { ...args } animated duration={ 150 } withinView value={ 300 } />
			</Group>
			<Group label="false">
				<Statistic { ...args } animated duration={ 150 } withinView={ false } value={ 300 } />
			</Group>
		</Row>
	),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement)

		await expect(await canvas.findByText('300', {}, { timeout: 3000 })).toBeInTheDocument()

		// `withinView: false` never becomes viewable, so the animation effect
		// never even starts — the value stays parked at its formatted `start`
		// (`0`), no matter how long we wait.
		await expect(canvas.getByText('0')).toBeInTheDocument()
	},
}

// `order` flips `setThemeCSS`'s root tokens: `'descend'` (the registered
// default) aligns content at the start in normal column order;
// `'ascend'` aligns at the end in reversed column order.
export const Order: Story = {
	parameters: { controls: { exclude: ['order'] } },
	render: (args) => (
		<Row>
			{ ORDER_OPTIONS.map(order => (
				<Group key={ order } label={ order }>
					<Statistic { ...args } order={ order } />
				</Group>
			)) }
		</Row>
	),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement),
			captions = canvas.getAllByText('Total signups')

		expect(captions).toHaveLength(ORDER_OPTIONS.length)

		// `ORDER_OPTIONS` is `['ascend', 'descend']` — destructure in that order.
		const [ascend, descend] = captions.map(
			caption => caption.closest('.inkq-statistic') as HTMLElement
		)

		await expect(descend).toHaveStyle({
			'--statistic-align': 'flex-start',
			'--statistic-direction': 'column',
		})

		await expect(ascend).toHaveStyle({
			'--statistic-align': 'flex-end',
			'--statistic-direction': 'column-reverse',
		})
	},
}

// `size` drives a hashed `module` config class (`inkq-statistic--sm`/
// `inkq-statistic--lg`, each with a real declaration in
// `Statistic.module.scss`) AND `setThemeCSS`'s root font tokens
// (`--statistic-font-caption`/`--statistic-font-value`) — the exact
// theme-derived font shorthand isn't asserted here (that's `ThemeProvider`'s
// concern, not `Statistic`'s), only that the module class swaps and that
// both custom properties are actually set.
export const Size: Story = {
	parameters: { controls: { exclude: ['size'] } },
	render: (args) => (
		<Row>
			{ SIZE_OPTIONS.map(size => (
				<Group key={ size } label={ size }>
					<Statistic { ...args } size={ size } />
				</Group>
			)) }
		</Row>
	),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement),
			captions = canvas.getAllByText('Total signups')

		expect(captions).toHaveLength(SIZE_OPTIONS.length)

		const [sm, lg] = captions.map(
			caption => caption.closest('.inkq-statistic') as HTMLElement
		)

		expect(hasModuleClass(sm, 'inkq-statistic--sm')).toBe(true)
		expect(hasModuleClass(sm, 'inkq-statistic--lg')).toBe(false)
		expect(hasModuleClass(lg, 'inkq-statistic--lg')).toBe(true)
		expect(hasModuleClass(lg, 'inkq-statistic--sm')).toBe(false)

		expect(sm.style.getPropertyValue('--statistic-font-caption')).not.toBe('')
		expect(sm.style.getPropertyValue('--statistic-font-value')).not.toBe('')
		expect(lg.style.getPropertyValue('--statistic-font-caption')).not.toBe('')
		expect(lg.style.getPropertyValue('--statistic-font-value')).not.toBe('')
	},
}

// `unstyled` does NOT remove any of `Statistic`'s semantic base classes — per
// `getClassName.tsx`, the base class is now ALWAYS emitted. It only
// suppresses the CSS-module-hashed class normally appended alongside it, and
// only where a hash exists to suppress in the first place: `root`, `inner`,
// and `value` each have a real declaration in `Statistic.module.scss` (root's
// own custom-property/layout rules live directly under `.inkq-statistic`,
// not just its nested `&__inner`/`&__value` rules), so their hash is
// genuinely suppressed when unstyled. `caption` (`&__caption`) has no own
// declaration — see the `caption` description above — and ALSO always
// carries the literal `inkq-caption` utility class from its `true`
// boolean-shorthand config (unaffected by `unstyled`, since only
// `getStyleClass` checks `check.isUnstyled` — never the boolean-config
// branch of `getConfigClasses`).
export const Unstyled: Story = {
	parameters: { controls: { exclude: ['unstyled'] } },
	render: (args) => (
		<Row>
			{ BOOLEAN_OPTIONS.map(unstyled => (
				<Group key={ String(unstyled) } label={ String(unstyled) }>
					<Statistic { ...args } unstyled={ unstyled } />
				</Group>
			)) }
		</Row>
	),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement),
			captions = canvas.getAllByText('Total signups')

		expect(captions).toHaveLength(2)

		const [unstyledRoot, styledRoot] = captions.map(
			caption => caption.closest('.inkq-statistic') as HTMLElement
		)

		// root — `.inkq-statistic` DOES carry its own declared rules directly
		// (custom properties, `flex-direction`, `justify-content`, `row-gap`),
		// not just nested `&__...`/`&--...` rules, so it genuinely hashes and
		// is genuinely suppressed when unstyled.
		await expect(styledRoot).toHaveClass('inkq-statistic')
		await expect(unstyledRoot).toHaveClass('inkq-statistic')
		expect(hasModuleClass(styledRoot, 'inkq-statistic')).toBe(true)
		expect(hasModuleClass(unstyledRoot, 'inkq-statistic')).toBe(false)

		// inner
		const styledInner = styledRoot.querySelector('.inkq-statistic__inner') as HTMLElement,
			unstyledInner = unstyledRoot.querySelector('.inkq-statistic__inner') as HTMLElement

		await expect(styledInner).toHaveClass('inkq-statistic__inner')
		await expect(unstyledInner).toHaveClass('inkq-statistic__inner')
		expect(hasModuleClass(styledInner, 'inkq-statistic__inner')).toBe(true)
		expect(hasModuleClass(unstyledInner, 'inkq-statistic__inner')).toBe(false)

		// value
		const styledValue = styledRoot.querySelector('.inkq-statistic__value') as HTMLElement,
			unstyledValue = unstyledRoot.querySelector('.inkq-statistic__value') as HTMLElement

		await expect(styledValue).toHaveClass('inkq-statistic__value')
		await expect(unstyledValue).toHaveClass('inkq-statistic__value')
		expect(hasModuleClass(styledValue, 'inkq-statistic__value')).toBe(true)
		expect(hasModuleClass(unstyledValue, 'inkq-statistic__value')).toBe(false)

		// caption — no own SCSS declaration, so no hash exists to suppress
		const styledCaption = styledRoot.querySelector('.inkq-statistic__caption') as HTMLElement,
			unstyledCaption = unstyledRoot.querySelector('.inkq-statistic__caption') as HTMLElement

		await expect(styledCaption).toHaveClass('inkq-statistic__caption', 'inkq-caption')
		await expect(unstyledCaption).toHaveClass('inkq-statistic__caption', 'inkq-caption')
	},
}
