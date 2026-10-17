import { getDefaultProps } from '@/hooks/useProps'
import userEvent from '@testing-library/user-event'
import { render, reset, screen } from '@/tests/test-utils'
import { tokens } from '@/lib/theme/reference'
import Link from 'next/link'
import { Button } from './Button'

// wraps the real `next/link` so a test can read the props Button forwards to it;
// rendering still goes through the real component
jest.mock('next/link', () => {
	const React = jest.requireActual('react')
	const { default: ActualLink } = jest.requireActual('next/link')
	const Spy = jest.fn((props: object) => React.createElement(ActualLink, props))
	return { __esModule: true, default: Spy }
})

describe('Button', () => {
	// this suite also renders real `Button.Group`/`Button.Section` compound
	// parts (see the nested describes below), so their registries need
	// resetting too, alongside `Button`'s own.
	reset('Button', 'Button.Group', 'Button.Section')

	const tracking = (el: HTMLElement) => el.style.getPropertyValue('--button-tracking')

	it('renders its children', () => {
		render(<Button>Save</Button>)
		expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument()
	})

	it('defaults to type="button" so it never submits a form by accident', () => {
		render(<Button>Save</Button>)
		expect(screen.getByRole('button')).toHaveAttribute('type', 'button')
	})

	it('respects an explicit type override instead of forcing "button"', () => {
		render(<Button type="submit">Save</Button>)
		expect(screen.getByRole('button')).toHaveAttribute('type', 'submit')
	})

	// FIX: this test rendered `href="/profile"` / "Go to profile" but asserted
	// against "/dashboard" / "Go to dashboard" — a query for content that was
	// never rendered, which throws from `getByRole` rather than failing an
	// assertion. Aligned the query with what's actually rendered.
	it('renders as a link when href is provided', () => {
		render(<Button href="/profile">Go to profile</Button>)
		expect(screen.getByRole('link', { name: 'Go to profile' })).toHaveAttribute('href', '/profile')
	})

	describe('link path', () => {
		const linkProps = () => jest.mocked(Link).mock.lastCall?.[0]

		beforeEach(() => jest.mocked(Link).mockClear())

		it('opens an external http(s) href in a new tab with a safe rel', () => {
			render(<Button href={ 'https://example.com/docs' as Button.Props['href'] }>Docs</Button>)
			const link = screen.getByRole('link', { name: 'Docs' })

			expect(link).toHaveAttribute('href', 'https://example.com/docs')
			expect(link).toHaveAttribute('target', '_blank')
			expect(link).toHaveAttribute('rel', 'noopener noreferrer')
		})

		it('keeps an internal href in the same tab, with no target or rel', () => {
			render(<Button href="/profile">Profile</Button>)
			const link = screen.getByRole('link', { name: 'Profile' })

			expect(link).toHaveAttribute('href', '/profile')
			expect(link).not.toHaveAttribute('target')
			expect(link).not.toHaveAttribute('rel')
		})

		it('keeps a hash href in the same tab, with no target or rel', () => {
			render(<Button href={ '#top' as Button.Props['href'] }>Top</Button>)
			const link = screen.getByRole('link', { name: 'Top' })

			expect(link).not.toHaveAttribute('target')
			expect(link).not.toHaveAttribute('rel')
		})

		it('does not open non-http schemes such as mailto: in a new tab', () => {
			render(<Button href={ 'mailto:hi@example.com' as Button.Props['href'] }>Mail</Button>)
			const link = screen.getByRole('link', { name: 'Mail' })

			expect(link).toHaveAttribute('href', 'mailto:hi@example.com')
			expect(link).not.toHaveAttribute('target')
		})

		it('forwards prefetch, replace and scroll to next/link', () => {
			render(<Button href="/profile" prefetch={ false } replace scroll={ false }>Profile</Button>)

			expect(linkProps()).toEqual(expect.objectContaining({
				href: '/profile',
				prefetch: false,
				replace: true,
				scroll: false,
			}))
		})

		it('forwards onNavigate to next/link', () => {
			const onNavigate = jest.fn()
			render(<Button href="/profile" onNavigate={ onNavigate }>Profile</Button>)

			expect(linkProps()?.onNavigate).toBe(onNavigate)
		})

		it('does not render a native button when href is set', () => {
			render(<Button href="/profile">Profile</Button>)
			expect(screen.queryByRole('button')).not.toBeInTheDocument()
		})
	})

	// FIX: this test passed `variant="danger"`, but "danger" is a `Tone`, not a
	// `Variant` — `Variant` is solid/outline/ghost/light/dark/text. It only
	// type-checked because Jest strips types without checking them. Split into
	// the two props the component actually takes, and added the `data-tone`
	// assertion the original was reaching for. `variant="outline"` rather than
	// the default "solid", so the assertion fails if the prop stops forwarding.
	it('reflects variant, tone and priority as data attributes for CSS targeting', () => {
		render(<Button variant="outline" tone="danger" priority="primary">Delete</Button>)
		const button = screen.getByRole('button', { name: 'Delete' })
		expect(button).toHaveAttribute('data-variant', 'outline')
		expect(button).toHaveAttribute('data-tone', 'danger')
		expect(button).toHaveAttribute('data-priority', 'primary')
	})

	it('falls back to the registered default variant when none is passed', () => {
		const defaults = getDefaultProps<Button.Props>('Button')
		render(<Button>Default</Button>)
		expect(screen.getByRole('button')).toHaveAttribute('data-variant', defaults.variant)
	})

	it('omits data-priority entirely when no priority is passed, rather than rendering an empty value', () => {
		render(<Button>Default</Button>)
		expect(screen.getByRole('button')).not.toHaveAttribute('data-priority')
	})

	it('marks full width via data-block', () => {
		render(<Button fullWidth>Wide</Button>)
		expect(screen.getByRole('button')).toHaveAttribute('data-block', '')
	})

	it('omits data-block entirely when fullWidth is falsy', () => {
		render(<Button>Narrow</Button>)
		expect(screen.getByRole('button')).not.toHaveAttribute('data-block')
	})

	it('disables the button natively and reflects it via data-disabled when disabled', () => {
		render(<Button disabled>Save</Button>)
		const button = screen.getByRole('button', { name: 'Save' })
		expect(button).toBeDisabled()
		expect(button).toHaveAttribute('data-disabled', '')
	})

	it('omits data-disabled entirely when not disabled', () => {
		render(<Button>Save</Button>)
		expect(screen.getByRole('button')).not.toHaveAttribute('data-disabled')
	})

	it('reflects loading state via data-loading and renders a spinner', () => {
		const { container } = render(<Button loading>Save</Button>)
		expect(screen.getByRole('button')).toHaveAttribute('data-loading', '')
		expect(container.querySelector('svg')).toBeInTheDocument()
	})

	it('omits data-loading entirely when not loading', () => {
		render(<Button>Save</Button>)
		expect(screen.getByRole('button')).not.toHaveAttribute('data-loading')
	})

	describe('showLabel / extractChildrenText', () => {
		it('does not set aria-label when showLabel is unset, even though it has text content', () => {
			render(<Button>Save</Button>)
			expect(screen.getByRole('button')).not.toHaveAttribute('aria-label')
		})

		it('derives aria-label from its text children when showLabel is set', () => {
			render(<Button showLabel>Save</Button>)
			expect(screen.getByRole('button')).toHaveAttribute('aria-label', 'Save')
		})

		it('recurses into Button.Section children to build the aria-label text', () => {
			render(
				<Button showLabel>
					<Button.Section left>Icon</Button.Section>
					Save
				</Button>
			)
			expect(screen.getByRole('button')).toHaveAttribute('aria-label', 'IconSave')
		})

		it('omits aria-label when showLabel is set but there is no text to derive one from', () => {
			render(
				<Button showLabel>
					<span />
				</Button>
			)
			expect(screen.getByRole('button')).not.toHaveAttribute('aria-label')
		})
	})

	describe('size', () => {
		it('applies size-specific design tokens that change when size changes', () => {
			const { rerender } = render(<Button>Save</Button>)
			// registered default is `size: 'md'`, not `sm`
			expect(tracking(screen.getByRole('button'))).toBe(tokens.letterSpacing('display'))

			rerender(<Button size="lg">Save</Button>)
			expect(tracking(screen.getByRole('button'))).toBe(tokens.letterSpacing('stat'))
		})
	})

	describe('animate', () => {
		it('reflects the direction as data-animate for CSS targeting', () => {
			render(<Button animate="arrow-right">Next</Button>)
			expect(screen.getByRole('button')).toHaveAttribute('data-animate', 'arrow-right')
		})

		it('sets the icon-translate token only when animate is set', () => {
			const translate = (el: HTMLElement) => el.style.getPropertyValue('--button-icon-translate')
			const { rerender } = render(<Button animate="arrow-left">Back</Button>)

			expect(translate(screen.getByRole('button'))).toMatch(/^calc\(.+ - .+\)$/)
			expect(translate(screen.getByRole('button'))).toContain(tokens.space('icon'))

			rerender(<Button>Back</Button>)
			expect(screen.getByRole('button')).not.toHaveAttribute('data-animate')
			expect(translate(screen.getByRole('button'))).toBe('')
		})

		it('changes the translate distance with size', () => {
			const translate = (el: HTMLElement) => el.style.getPropertyValue('--button-icon-translate')
			const { rerender } = render(<Button animate="arrow-right" size="sm">Next</Button>)
			const small = translate(screen.getByRole('button'))

			rerender(<Button animate="arrow-right" size="lg">Next</Button>)
			expect(translate(screen.getByRole('button'))).not.toBe(small)
		})
	})

	describe('action / hasIcon', () => {
		const iconOf = (el: HTMLElement) => el.querySelector('svg')

		it('defaults hasIcon to true in the registry', () => {
			expect(getDefaultProps<Button.Props>('Button')).toMatchObject({ hasIcon: true })
		})

		it('renders no icon for a plain button, as a control for the action cases', () => {
			render(<Button>Plain</Button>)
			expect(iconOf(screen.getByRole('button'))).toBeNull()
		})

		it('prepends a copy icon in a left section for action="copy"', () => {
			render(<Button action="copy">Copy link</Button>)
			const button = screen.getByRole('button', { name: 'Copy link' })
			const icon = iconOf(button)

			expect(icon).toHaveClass('lucide-copy')
			expect(icon?.closest('[data-side]')).toHaveAttribute('data-side', 'left')
			expect(screen.getByText('Copy link')).toBeInTheDocument()
		})

		it('prepends a printer icon for action="print"', () => {
			render(<Button action="print">Print</Button>)
			expect(iconOf(screen.getByRole('button'))).toHaveClass('lucide-printer')
		})

		it('renders an action button with several children, keeping each one', () => {
			render(<Button action="copy">Copy <b>it</b></Button>)
			const button = screen.getByRole('button', { name: 'Copy it' })

			expect(iconOf(button)).toHaveClass('lucide-copy')
			expect(button.querySelector('b')).toHaveTextContent('it')
		})

		it('never changes the children it was given, so re-renders add no extra icons', () => {
			const children = ['Copy ', <b key="b">it</b>]
			const { rerender } = render(<Button action="copy">{ children }</Button>)
			rerender(<Button action="copy">{ children }</Button>)

			expect(screen.getByRole('button', { name: 'Copy it' }).querySelectorAll('svg')).toHaveLength(1)
			expect(children).toHaveLength(2)
		})

		it('omits the action icon when hasIcon is false, keeping the label', () => {
			render(<Button action="copy" hasIcon={ false }>Copy link</Button>)
			const button = screen.getByRole('button', { name: 'Copy link' })

			expect(iconOf(button)).toBeNull()
		})

		it('calls window.print and the consumer onClick for action="print"', async () => {
			const user = userEvent.setup()
			const print = jest.spyOn(window, 'print').mockImplementation(() => {})
			const onClick = jest.fn()

			try {
				render(<Button action="print" onClick={ onClick }>Print</Button>)
				await user.click(screen.getByRole('button', { name: 'Print' }))

				expect(onClick).toHaveBeenCalledTimes(1)
				expect(print).toHaveBeenCalledTimes(1)
			} finally {
				print.mockRestore()
			}
		})

		it('does not call window.print for action="copy", nor for a plain button', async () => {
			const user = userEvent.setup()
			const print = jest.spyOn(window, 'print').mockImplementation(() => {})
			const onClick = jest.fn()

			try {
				render(
					<>
						<Button action="copy" onClick={ onClick }>Copy</Button>
						<Button>Plain</Button>
					</>
				)
				await user.click(screen.getByRole('button', { name: 'Copy' }))
				await user.click(screen.getByRole('button', { name: 'Plain' }))

				expect(onClick).toHaveBeenCalledTimes(1)
				expect(print).not.toHaveBeenCalled()
			} finally {
				print.mockRestore()
			}
		})
	})

	describe('unstyled', () => {
		// `Button.tsx` destructures `unstyled` out of `props` but re-includes it
		// on `sharedProps`, which is spread onto the root `<Box>` alongside
		// `attributes.data` — so `buildAttributes` (`Box/utils/buildAttributes.ts`)
		// sees `unstyled` on that Box's own incoming props and its `keepStateAttrs`
		// filtering correctly applies to Button's root element, the same as
		// `Badge.tsx` (see `Badge.test.tsx`).
		it('drops decorative data attributes (variant, tone, priority, block) but keeps loading, a state attribute', () => {
			render(
				<Button unstyled variant="outline" tone="danger" priority="primary" fullWidth loading>
					Save
				</Button>
			)
			const button = screen.getByRole('button')

			expect(button).not.toHaveAttribute('data-variant')
			expect(button).not.toHaveAttribute('data-tone')
			expect(button).not.toHaveAttribute('data-priority')
			expect(button).not.toHaveAttribute('data-block')
			expect(button).toHaveAttribute('data-loading', '')
		})

		it('still applies the native disabled attribute, even though data-disabled is dropped as redundant', () => {
			render(<Button unstyled disabled>Save</Button>)
			const button = screen.getByRole('button')

			expect(button).toBeDisabled()
			expect(button).not.toHaveAttribute('data-disabled')
		})
	})

	describe('as="a" without href', () => {
		it('does not inject a type attribute (that is a <button>-only default)', () => {
			const { container } = render(<Button as="a">Text</Button>)
			const anchor = container.querySelector('a')

			expect(anchor).not.toHaveAttribute('type')
		})

		it('does not apply native disabled, since "a" is not a disableable tag, even though data-disabled still reflects the prop', () => {
			const { container } = render(<Button as="a" disabled>Text</Button>)
			const anchor = container.querySelector('a')

			expect(anchor).not.toHaveAttribute('disabled')
			expect(anchor).toHaveAttribute('data-disabled', '')
		})
	})

	describe('className / classNames merging', () => {
		it('merges className and the classNames alias into a single class list', () => {
			render(<Button className="foo" classNames="bar">Save</Button>)
			const button = screen.getByRole('button')

			expect(button.className.split(/\s+/)).toEqual(expect.arrayContaining(['foo', 'bar']))
		})
	})

	describe('Button.Group', () => {
		it('inherits disabled/priority/size from the group, but an explicit own prop always wins (Object.hasOwn precedence)', () => {
			render(
				<Button.Group disabled size="lg">
					<Button>First</Button>
					<Button priority="tertiary">Second</Button>
					<Button disabled={ false }>Third</Button>
				</Button.Group>
			)

			const first = screen.getByRole('button', { name: 'First' })
			const second = screen.getByRole('button', { name: 'Second' })
			const third = screen.getByRole('button', { name: 'Third' })

			// inherits group `disabled`
			expect(first).toBeDisabled()
			expect(first).toHaveAttribute('data-disabled', '')
			// derives priority from position when hasPriority defaults to true
			expect(first).toHaveAttribute('data-priority', 'primary')

			// own explicit `priority` beats the group-derived value (would
			// otherwise derive "secondary" for the 2nd child)
			expect(second).toHaveAttribute('data-priority', 'tertiary')
			expect(second).toBeDisabled()

			// own explicit `disabled={false}` beats the group's `disabled`
			expect(third).not.toBeDisabled()
			expect(third).not.toHaveAttribute('data-disabled')
		})

		it('cascades a group-level size to children that do not set their own', () => {
			render(
				<>
					<Button.Group size="lg">
						<Button>Grouped</Button>
					</Button.Group>
					<Button>Standalone</Button>
				</>
			)

			const grouped = screen.getByRole('button', { name: 'Grouped' })
			const standalone = screen.getByRole('button', { name: 'Standalone' })

			expect(tracking(grouped)).toBe(tokens.letterSpacing('stat'))
			expect(tracking(standalone)).toBe(tokens.letterSpacing('display'))
		})

		it('renders a group role for assistive tech', () => {
			render(
				<Button.Group>
					<Button>Only</Button>
				</Button.Group>
			)
			expect(screen.getByRole('group')).toBeInTheDocument()
		})
	})

	describe('Button.Section', () => {
		it('throws when rendered outside of a Button', () => {
			const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {})

			expect(() => render(<Button.Section left>Icon</Button.Section>)).toThrow(
				/must be a direct child of <Button>/
			)

			consoleError.mockRestore()
		})

		// `ButtonSection.set({ displayName })` registers no `defaultProps` on purpose. An
		// earlier `{ left: true }` default could never be overridden: `useProps`
		// fills defaults in before merging the caller's props and only overwrites
		// keys the caller actually passed, and `<Button.Section right>` passes no
		// `left` key at all (the discriminated union only requires `right`), so
		// props merged to `{ left: true, right: true }` and `side` — which reads
		// `left ? 'left' : 'right'` — always resolved to `'left'`. With no default
		// registered, `side` now follows whichever prop the caller actually passed.
		it('marks the left and right sections with a matching data-side attribute', () => {
			render(
				<Button>
					<Button.Section left>L</Button.Section>
					Middle
					<Button.Section right>R</Button.Section>
				</Button>
			)

			expect(screen.getByText('L')).toHaveAttribute('data-side', 'left')
			expect(screen.getByText('R')).toHaveAttribute('data-side', 'right')
		})

		// Guards the fix above at its root: if a `left` default is ever
		// re-registered, `data-side="right"` silently breaks again.
		it('registers no default props, so neither side is pre-filled', () => {
			expect(getDefaultProps('Button.Section')).toEqual({})
		})

		it('warns in dev and renders only the first section when a side is duplicated', () => {
			const consoleWarn = jest.spyOn(console, 'warn').mockImplementation(() => {})

			render(
				<Button>
					<Button.Section left>First</Button.Section>
					<Button.Section left>Second</Button.Section>
					Label
				</Button>
			)

			expect(screen.getByText('First')).toBeInTheDocument()
			expect(screen.queryByText('Second')).not.toBeInTheDocument()
			expect(consoleWarn).toHaveBeenCalledWith(
				'Button: ignoring repeated Button.Section[left]; only the first is rendered.'
			)

			consoleWarn.mockRestore()
		})
	})
})
