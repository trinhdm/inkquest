import { render, screen } from '@/tests/test-utils'
import { Box } from '@/components/core/Box/Box'

// `Box` (`toPolymorphic`, not `polymorphic`/`factory`) doesn't call
// `useVariantStyles`/`setDefaults`, so there's no variant-style or
// component-defaults registry state to reset here — unlike the `factory()`
// components (`Button`, `Badge`, `Card`, `Icon`).
describe('Box', () => {
	describe('attribute prefixing (aria-*/data-*) and kebab-casing', () => {
		it('prefixes aria keys with "aria-"', () => {
			// `SpecAttributes['aria']` is typed as `AriaAttributes` with the
			// `aria-` prefix stripped (see `src/types/shared/html.ts`), so its
			// keys are already React's real (lowercase, unhyphenated) ARIA names
			// — `describedby`, not a camelCase `describedBy`.
			render(<Box attributes={ { aria: { describedby: 'hint-id' } } }>Content</Box>)
			expect(screen.getByText('Content')).toHaveAttribute('aria-describedby', 'hint-id')
		})

		it('prefixes and kebab-cases camelCase data keys', () => {
			render(<Box attributes={ { data: { someFlag: true } } }>Content</Box>)
			expect(screen.getByText('Content')).toHaveAttribute('data-some-flag', 'true')
		})
	})

	describe('hasValue dropping empty values', () => {
		it('drops an empty string, empty array, and empty plain object, but keeps a non-empty value', () => {
			render(
				<Box attributes={ {
					data: { label: '', tags: [], meta: {}, keep: 'x' },
				} }>
					Content
				</Box>
			)
			const el = screen.getByText('Content')

			expect(el).not.toHaveAttribute('data-label')
			expect(el).not.toHaveAttribute('data-tags')
			expect(el).not.toHaveAttribute('data-meta')
			expect(el).toHaveAttribute('data-keep', 'x')
		})

		it('keeps a non-empty array and non-empty object-shaped value', () => {
			render(
				<Box attributes={ {
					data: { tags: ['a'], meta: { x: 1 } },
				} }>
					Content
				</Box>
			)
			const el = screen.getByText('Content')

			expect(el).toHaveAttribute('data-tags')
			expect(el).toHaveAttribute('data-meta')
		})

		it('drops null/undefined values entirely, rather than rendering them as empty attributes', () => {
			render(
				<Box attributes={ { data: { missing: undefined, absent: null } } }>
					Content
				</Box>
			)
			const el = screen.getByText('Content')

			expect(el).not.toHaveAttribute('data-missing')
			expect(el).not.toHaveAttribute('data-absent')
		})
	})

	describe('type="button" injection', () => {
		it('injects type="button" when the resolved element is a native button and no type was given', () => {
			render(<Box as="button">Click</Box>)
			expect(screen.getByRole('button')).toHaveAttribute('type', 'button')
		})

		it('does not override an explicitly provided type', () => {
			render(<Box as="button" type="submit">Click</Box>)
			expect(screen.getByRole('button')).toHaveAttribute('type', 'submit')
		})

		it('does not inject type for a non-button element', () => {
			const { container } = render(<Box as="a">Click</Box>)
			expect(container.querySelector('a')).not.toHaveAttribute('type')
		})
	})

	describe('native disabled — only for DISABLEABLE_TAGS', () => {
		it('applies native disabled on a button when data.disabled is true', () => {
			render(<Box as="button" attributes={ { data: { disabled: true } } }>Click</Box>)
			expect(screen.getByRole('button')).toBeDisabled()
		})

		it('does not apply a native disabled attribute on a non-disableable tag like <a>, even with data.disabled true', () => {
			const { container } = render(
				<Box as="a" attributes={ { data: { disabled: true } } }>Click</Box>
			)
			const anchor = container.querySelector('a')

			expect(anchor).not.toHaveAttribute('disabled')
			// the data attribute itself is unaffected by DISABLEABLE_TAGS —
			// that gate only controls the native HTML `disabled` attribute
			expect(anchor).toHaveAttribute('data-disabled', 'true')
		})
	})

	describe('unstyled decorative filtering', () => {
		it('drops non-state data keys but keeps state keys (loading) when unstyled', () => {
			render(
				<Box unstyled as="div" attributes={ {
					data: { variant: 'solid', loading: true },
				} }>
					Content
				</Box>
			)
			const el = screen.getByText('Content')

			expect(el).not.toHaveAttribute('data-variant')
			expect(el).toHaveAttribute('data-loading', 'true')
		})

		it('drops data-disabled when unstyled AND the tag is disableable (native disabled already conveys it)', () => {
			render(
				<Box unstyled as="button" attributes={ { data: { disabled: true } } }>
					Click
				</Box>
			)
			const button = screen.getByRole('button')

			expect(button).toBeDisabled()
			expect(button).not.toHaveAttribute('data-disabled')
		})

		it('keeps data-disabled when unstyled but the tag is NOT disableable (no native duplicate to defer to)', () => {
			const { container } = render(
				<Box unstyled as="a" attributes={ { data: { disabled: true } } }>
					Click
				</Box>
			)
			const anchor = container.querySelector('a')

			expect(anchor).not.toHaveAttribute('disabled')
			expect(anchor).toHaveAttribute('data-disabled', 'true')
		})

		it('does not filter data attributes when unstyled is not set', () => {
			render(
				<Box as="div" attributes={ { data: { variant: 'solid' } } }>
					Content
				</Box>
			)
			expect(screen.getByText('Content')).toHaveAttribute('data-variant', 'solid')
		})
	})

	describe('children rendering / defaults', () => {
		it('renders as a div by default', () => {
			const { container } = render(<Box>Content</Box>)
			expect(container.firstElementChild?.tagName).toBe('DIV')
		})

		it('renders the provided element via "as"', () => {
			const { container } = render(<Box as="span">Content</Box>)
			expect(container.firstElementChild?.tagName).toBe('SPAN')
		})
	})
})
