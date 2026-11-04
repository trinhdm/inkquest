import { getDefaultProps } from '@/hooks/useProps'
import { render, reset, screen } from '@/tests/test-utils'
import { Avatar } from './Avatar'

const getRoot = (container: HTMLElement) => container.firstElementChild as HTMLElement
const token = (root: HTMLElement, name: string) => root.style.getPropertyValue(name)

describe('Avatar', () => {
	reset('Avatar')

	it('renders a span and the registered lg size tokens by default', () => {
		const defaults = getDefaultProps<
			Avatar.Props & Pick<Avatar.Specs['defaults'], 'as'>
		>('Avatar')
		const { container } = render(<Avatar user={ { email: 'a@b.co' } } />)
		const root = getRoot(container)

		expect(defaults.as).toBe('span')
		expect(defaults.size).toBe('lg')
		expect(root.tagName).toBe('SPAN')
		expect(token(root, '--avatar-font-size')).toBe('var(--inkq-font-size-label)')
		expect(token(root, '--avatar-icon-size')).toBe('var(--inkq-avatar-lg)')
	})

	it('is hidden from assistive tech because it is decorative', () => {
		const { container } = render(<Avatar user={ { email: 'a@b.co', name: 'Ann Lee' } } />)
		expect(getRoot(container)).toHaveAttribute('aria-hidden', 'true')
	})

	describe('initials', () => {
		it.each([
			['two words', 'Ann Lee', 'AL'],
			['three words (first two kept)', 'Ann Marie Lee', 'AM'],
			['one word', 'Ann', 'A'],
			['lowercase input', 'ann lee', 'AL'],
			['extra, leading and trailing spaces', '   ann    lee   ', 'AL'],
			['an emoji first character (kept whole)', '🐙 octo', '🐙O'],
		])('uses %s', (_label, name, expected) => {
			render(<Avatar user={ { email: 'a@b.co', name } } />)
			expect(screen.getByText(expected)).toBeInTheDocument()
		})

		it('falls back to the email when there is no name', () => {
			render(<Avatar user={ { email: 'zed@b.co' } } />)
			expect(screen.getByText('Z')).toBeInTheDocument()
		})
	})

	describe('photo', () => {
		it('renders the image with the name as alt and no initials', () => {
			render(<Avatar user={ { email: 'a@b.co', name: 'Ann Lee', avatar_url: 'https://x.test/a.png' } } />)
			expect(screen.getByRole('img', { hidden: true })).toHaveAttribute('alt', 'Ann Lee')
			expect(screen.queryByText('AL')).not.toBeInTheDocument()
		})

		it('falls back to the email for alt when there is no name', () => {
			render(<Avatar user={ { email: 'a@b.co', avatar_url: 'https://x.test/a.png' } } />)
			expect(screen.getByRole('img', { hidden: true })).toHaveAttribute('alt', 'a@b.co')
		})

		it('shows initials instead when avatar_url is an empty string', () => {
			render(<Avatar user={ { email: 'a@b.co', name: 'Ann Lee', avatar_url: '' } } />)
			expect(screen.getByText('AL')).toBeInTheDocument()
			expect(screen.queryByRole('img', { hidden: true })).not.toBeInTheDocument()
		})
	})

	it('sets --avatar-ring only when ring is true', () => {
		const user = { email: 'a@b.co' }
		const { container: ringed } = render(<Avatar user={ user } ring />)
		const { container: plain } = render(<Avatar user={ user } />)

		expect(token(getRoot(ringed), '--avatar-ring')).toBe('0 0 0 2px var(--inkq-color-action)')
		expect(token(getRoot(plain), '--avatar-ring')).toBe('')
	})

	it.each([
		['sm', 'var(--inkq-font-size-control)', 'var(--inkq-avatar-sm)'],
		['md', 'var(--inkq-font-size-caption)', 'var(--inkq-avatar-md)'],
		['lg', 'var(--inkq-font-size-label)', 'var(--inkq-avatar-lg)'],
	] as const)('size %s sets its own font and icon size', (size, font, icon) => {
		const { container } = render(<Avatar user={ { email: 'a@b.co' } } size={ size } />)
		const root = getRoot(container)

		expect(token(root, '--avatar-font-size')).toBe(font)
		expect(token(root, '--avatar-icon-size')).toBe(icon)
	})

	it('uses bgColor for the background, else the theme card colour', () => {
		const user = { email: 'a@b.co' }
		const { container: custom } = render(<Avatar user={ user } bgColor="red" />)
		const { container: themed } = render(<Avatar user={ user } />)

		expect(token(getRoot(custom), '--avatar-background')).toBe('red')
		expect(token(getRoot(themed), '--avatar-background')).toBe('var(--inkq-background-card-hover)')
	})

	it('renders the polymorphic "as" element and forwards pass-through props', () => {
		const { container } = render(<Avatar as="div" id="me" user={ { email: 'a@b.co' } } />)
		const root = getRoot(container)

		expect(root.tagName).toBe('DIV')
		expect(root).toHaveAttribute('id', 'me')
	})
})
