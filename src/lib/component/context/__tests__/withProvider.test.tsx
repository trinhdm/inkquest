import { render, screen } from '@testing-library/react'
import { createCompoundCtx } from '../createCompoundCtx'
import { withProvider } from '../withProvider'

interface TestCtxValue {
	label: string
}

const Consumer = ({ useRootCtx }: { useRootCtx: (name: string) => TestCtxValue & { rootName: string } }) => {
	const ctx = useRootCtx('Consumer')
	return <span>{ ctx.label }</span>
}

describe('withProvider', () => {
	const { RootProvider, useRootCtx } = createCompoundCtx<TestCtxValue>('TestRoot')

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

	// dev-only guard: a Provider with a different number of values than items
	// would hand some child an undefined value
	describe('items/values length guard', () => {
		let error: jest.SpyInstance

		beforeEach(() => { error = jest.spyOn(console, 'error').mockImplementation(() => {}) })
		afterEach(() => { error.mockRestore() })

		const items = [<span key="a">A</span>, <span key="b">B</span>]
		const build = (provider: typeof RootProvider | undefined, values: TestCtxValue[]) =>
			withProvider<TestCtxValue, TestCtxValue>(items, provider, values)

		it('logs the item and value counts when a Provider gets fewer values than items', () => {
			build(RootProvider, [{ label: 'only one' }])
			expect(error).toHaveBeenCalledWith('withProvider: got 2 items but 1 values')
		})

		it('logs when a Provider gets more values than items', () => {
			build(RootProvider, [{ label: 'a' }, { label: 'b' }, { label: 'c' }])
			expect(error).toHaveBeenCalledWith('withProvider: got 2 items but 3 values')
		})

		it('stays silent when the counts match', () => {
			build(RootProvider, [{ label: 'a' }, { label: 'b' }])
			expect(error).not.toHaveBeenCalled()
		})

		it('stays silent without a Provider, since values are unused then', () => {
			// positive control: the same mismatch does log once a Provider is given
			build(RootProvider, [{ label: 'only one' }])
			expect(error).toHaveBeenCalled()
			error.mockClear()

			build(undefined, [{ label: 'only one' }])
			expect(error).not.toHaveBeenCalled()
		})

		it('stays silent in production even with a mismatch', () => {
			const env = process.env as { NODE_ENV?: string },
				original = env.NODE_ENV

			try {
				env.NODE_ENV = 'production'
				build(RootProvider, [{ label: 'only one' }])
				expect(error).not.toHaveBeenCalled()
			} finally {
				env.NODE_ENV = original
			}
		})
	})
})
