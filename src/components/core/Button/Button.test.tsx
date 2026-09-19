import { getDefaultProps } from '@/hooks/useProps'
import { render, reset, screen } from '@/tests/test-utils'
import { Button } from './Button'

describe('Button', () => {
	reset('Button')

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

	it('reflects variant and priority as data attributes for CSS targeting', () => {
		render(<Button variant="danger" priority="primary">Delete</Button>)
		const button = screen.getByRole('button', { name: 'Delete' })
		expect(button).toHaveAttribute('data-variant', 'danger')
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
		expect(screen.getByRole('button')).toHaveAttribute('data-block', 'true')
	})

	it('omits data-block entirely when fullWidth is falsy', () => {
		render(<Button>Narrow</Button>)
		expect(screen.getByRole('button')).not.toHaveAttribute('data-block')
	})

	it('disables the button natively and reflects it via data-disabled when disabled', () => {
		render(<Button disabled>Save</Button>)
		const button = screen.getByRole('button', { name: 'Save' })
		expect(button).toBeDisabled()
		expect(button).toHaveAttribute('data-disabled', 'true')
	})

	it('omits data-disabled entirely when not disabled', () => {
		render(<Button>Save</Button>)
		expect(screen.getByRole('button')).not.toHaveAttribute('data-disabled')
	})

	it('reflects loading state via data-loading and renders a spinner', () => {
		const { container } = render(<Button loading>Save</Button>)
		expect(screen.getByRole('button')).toHaveAttribute('data-loading', 'true')
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
		it('applies a size-specific class that changes when size changes', () => {
			const { rerender } = render(<Button>Save</Button>)
			const smClassName = screen.getByRole('button').className

			rerender(<Button size="lg">Save</Button>)
			const lgClassName = screen.getByRole('button').className

			expect(smClassName).not.toBe(lgClassName)
		})
	})

	describe('unstyled', () => {
		// SOURCE BUG: `Button.tsx` destructures `unstyled` out of `props` and only
		// ever forwards it into `ButtonProvider`'s context (for `Button.Section`)
		// — it never re-attaches `unstyled` to `sharedProps`/`others`, so the root
		// `<Box>` that carries `attributes.data` never receives `unstyled` itself.
		// `getAttributes` (`Box/utils/get-attributes.ts`) reads `_props.unstyled`
		// straight off that Box's own incoming props, so `filterDecorative` never
		// fires for Button's root element — contrast with `Badge.tsx`, which does
		// NOT destructure `unstyled` out (it flows through `...rest` into
		// `others`), so the same filtering correctly applies there (see
		// `Badge.test.tsx`). Left as a failing test on purpose — do not "fix" by
		// weakening the assertion; the fix belongs in `Button.tsx`.
		it('drops decorative data attributes (variant, priority, block) but keeps loading, a state attribute', () => {
			render(
				<Button unstyled variant="danger" priority="primary" fullWidth loading>
					Save
				</Button>
			)
			const button = screen.getByRole('button')

			expect(button).not.toHaveAttribute('data-variant')
			expect(button).not.toHaveAttribute('data-priority')
			expect(button).not.toHaveAttribute('data-block')
			expect(button).toHaveAttribute('data-loading', 'true')
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
			expect(anchor).toHaveAttribute('data-disabled', 'true')
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
			expect(first).toHaveAttribute('data-disabled', 'true')
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

			expect(grouped.className).not.toBe(standalone.className)
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
				/must be rendered inside <Button>/
			)

			consoleError.mockRestore()
		})

		// `ButtonSection.setDefaults({})` registers no defaults on purpose. An
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
				expect.stringContaining('multiple Button.Section[left] found')
			)

			consoleWarn.mockRestore()
		})
	})
})
