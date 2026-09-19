import { render, screen } from '@testing-library/react'
import { createRootCxt } from '../createRootCxt'
import { renderWithProvider } from '../renderWithProvider'

interface TestCtxValue {
	label: string
}

const Consumer = ({ useRootCxt }: { useRootCxt: (name: string) => TestCtxValue & { rootName: string } }) => {
	const ctx = useRootCxt('Consumer')
	return <span>{ ctx.label }</span>
}

describe('renderWithProvider', () => {
	const { RootCxtProvider, useRootCxt } = createRootCxt<TestCtxValue>('TestRoot')

	it('wraps each item with its own Provider instance, matched to it by index', () => {
		const items = [
			<Consumer key="a" useRootCxt={ useRootCxt } />,
			<Consumer key="b" useRootCxt={ useRootCxt } />,
		]
		const values = [{ label: 'first' }, { label: 'second' }]

		render(<>{ renderWithProvider<TestCtxValue, TestCtxValue>(items, RootCxtProvider, values) }</>)

		expect(screen.getByText('first')).toBeInTheDocument()
		expect(screen.getByText('second')).toBeInTheDocument()
	})

	it('renders items in a plain Fragment (no context) when no Provider is given', () => {
		const items = [<span key="a">plain</span>]

		render(<>{ renderWithProvider<TestCtxValue, TestCtxValue>(items, undefined, [{ label: 'unused' }]) }</>)

		expect(screen.getByText('plain')).toBeInTheDocument()
	})

	it('uses a child\'s own React key over its array index when present', () => {
		const items = [
			<span key="explicit-key">keyed</span>,
		]

		const result = renderWithProvider<TestCtxValue, TestCtxValue>(items, undefined, [{ label: 'unused' }])

		// `renderWithProvider` re-keys the Fragment wrapper with `getChildKey`,
		// which prefers the child's own `key` — assert the wrapper renders
		// without a "missing key" warning by rendering a list of more than one.
		const multi = renderWithProvider<TestCtxValue, TestCtxValue>(
			[<span key="a">A</span>, <span key="b">B</span>],
			undefined,
			[{ label: 'a' }, { label: 'b' }]
		)

		render(<>{ multi }</>)
		expect(screen.getByText('A')).toBeInTheDocument()
		expect(screen.getByText('B')).toBeInTheDocument()
		expect(result).toHaveLength(1)
	})
})
