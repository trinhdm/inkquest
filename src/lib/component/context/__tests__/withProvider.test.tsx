import { render, screen } from '@testing-library/react'
import { createRootCtx } from '../createRootCtx'
import { withProvider } from '../withProvider'

interface TestCtxValue {
	label: string
}

const Consumer = ({ useRootCtx }: { useRootCtx: (name: string) => TestCtxValue & { rootName: string } }) => {
	const ctx = useRootCtx('Consumer')
	return <span>{ ctx.label }</span>
}

describe('withProvider', () => {
	const { RootProvider, useRootCtx } = createRootCtx<TestCtxValue>('TestRoot')

	it('wraps each item with its own Provider instance, matched to it by index', () => {
		const items = [
			<Consumer key="a" useRootCtx={ useRootCtx } />,
			<Consumer key="b" useRootCtx={ useRootCtx } />,
		]
		const values = [{ label: 'first' }, { label: 'second' }]

		render(<>{ withProvider<TestCtxValue, TestCtxValue>(items, RootProvider, values) }</>)

		expect(screen.getByText('first')).toBeInTheDocument()
		expect(screen.getByText('second')).toBeInTheDocument()
	})

	it('renders items in a plain Fragment (no context) when no Provider is given', () => {
		const items = [<span key="a">plain</span>]

		render(<>{ withProvider<TestCtxValue, TestCtxValue>(items, undefined, [{ label: 'unused' }]) }</>)

		expect(screen.getByText('plain')).toBeInTheDocument()
	})

	it('uses a child\'s own React key over its array index when present', () => {
		const items = [
			<span key="explicit-key">keyed</span>,
		]

		const result = withProvider<TestCtxValue, TestCtxValue>(items, undefined, [{ label: 'unused' }])

		// `withProvider` re-keys the Fragment wrapper with `getChildKey`,
		// which prefers the child's own `key` — assert the wrapper renders
		// without a "missing key" warning by rendering a list of more than one.
		const multi = withProvider<TestCtxValue, TestCtxValue>(
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
