import { render, reset } from '@/tests/test-utils'
import { Button } from '../Button'
import { ButtonProvider } from '../Button.context'
import { buildSections } from './buildSections'
import type { ReactNode } from 'react'
import type { StyleFn } from '@/hooks/useStyles'

// `buildSections` only calls `styles('label')` and spreads the result onto a span,
// so a stand-in that returns the selector name as the class is enough to find it
const styles = ((name: string) => ({ className: `s-${name}` })) as unknown as StyleFn<Button.Specs>

// sections read `useButtonCtx`, so the output has to live under a ButtonProvider
const renderSections = (children: ReactNode, parentName = 'Button') =>
	render(
		<ButtonProvider value={ {} }>
			<div data-testid="host">{ buildSections({ children, parentName, styles }) }</div>
		</ButtonProvider>
	)

describe('buildSections', () => {
	reset('Button', 'Button.Section')

	let consoleWarn: jest.SpyInstance

	beforeEach(() => {
		consoleWarn = jest.spyOn(console, 'warn').mockImplementation(() => {})
	})

	afterEach(() => consoleWarn.mockRestore())

	const host = (c: HTMLElement) => c.querySelector('[data-testid="host"]') as HTMLElement

	it('wraps plain children in a single label span and nothing else when there are no sections', () => {
		const { container } = renderSections(['Save ', 'draft'])
		const el = host(container)

		expect(el.children).toHaveLength(1)
		expect(el.firstElementChild).toHaveClass('s-label')
		expect(el.firstElementChild).toHaveTextContent('Save draft')
		expect(consoleWarn).not.toHaveBeenCalled()
	})

	it('renders an empty label span for no children', () => {
		const { container } = renderSections(null)
		const label = host(container).querySelector('.s-label')

		expect(label).toBeInTheDocument()
		expect(label).toBeEmptyDOMElement()
	})

	it('places the left section before and the right section after the label, whatever the source order', () => {
		const { container } = renderSections([
			<Button.Section key="r" right>R</Button.Section>,
			'Middle',
			<Button.Section key="l" left>L</Button.Section>,
		])
		const kids = Array.from(host(container).children)

		expect(kids.map(k => k.textContent)).toEqual(['L', 'Middle', 'R'])
		expect(kids[0]).toHaveAttribute('data-side', 'left')
		expect(kids[1]).toHaveClass('s-label')
		expect(kids[2]).toHaveAttribute('data-side', 'right')
	})

	it('keeps sections out of the label span', () => {
		const { container } = renderSections([
			<Button.Section key="l" left>L</Button.Section>,
			'Middle',
		])

		expect(container.querySelector('.s-label')).toHaveTextContent(/^Middle$/)
	})

	it('renders a lone right section after the label', () => {
		const { container } = renderSections([
			'Middle',
			<Button.Section key="r" right>R</Button.Section>,
		])

		expect(Array.from(host(container).children).map(k => k.textContent)).toEqual(['Middle', 'R'])
	})

	it('sends non-section elements, numbers and text to the label', () => {
		const { container } = renderSections([
			<em key="em">emphasis</em>,
			42,
			<Button.Section key="l" left>L</Button.Section>,
		])
		const label = container.querySelector('.s-label')

		expect(label).toHaveTextContent('emphasis42')
		expect(label?.querySelector('em')).toBeInTheDocument()
		expect(label).not.toHaveTextContent('L')
	})

	it('keeps the first right section and warns once about a repeated one', () => {
		const { container } = renderSections([
			<Button.Section key="a" right>First</Button.Section>,
			<Button.Section key="b" right>Second</Button.Section>,
			'Label',
		])

		expect(container).toHaveTextContent('First')
		expect(container).not.toHaveTextContent('Second')
		expect(consoleWarn).toHaveBeenCalledTimes(1)
		expect(consoleWarn).toHaveBeenCalledWith(
			'Button: ignoring repeated Button.Section[right]; only the first is rendered.'
		)
	})

	it('does not treat a left and a right section as repeats of each other', () => {
		const { container } = renderSections([
			<Button.Section key="a" left>A</Button.Section>,
			<Button.Section key="b" right>B</Button.Section>,
		])

		expect(container).toHaveTextContent('AB')
		expect(consoleWarn).not.toHaveBeenCalled()
	})

	it('names the calling parent in the repeated-section warning', () => {
		renderSections([
			<Button.Section key="a" left>A</Button.Section>,
			<Button.Section key="b" left>B</Button.Section>,
		], 'Custom')

		expect(consoleWarn).toHaveBeenCalledWith(
			'Custom: ignoring repeated Button.Section[left]; only the first is rendered.'
		)
	})
})
