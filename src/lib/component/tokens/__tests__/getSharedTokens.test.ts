import { getSharedTokens } from '../getSharedTokens'
import type { TokensParams } from '../defineTokens'

// getSharedTokens wraps a callback so one token definition can be shared by an
// item and its group. The rule (confirmed 2026-10-14): a group's values always
// win. An item named 'root' that sits inside a group (it has a context) emits
// {} and the group's root supplies the tokens through CSS inheritance. Every
// other name ('group', 'choice', 'input', 'textarea') always reaches the
// callback.

interface TestSpecs {
	context: { id: string }
	props: { size?: 'sm' | 'md' }
	selectors: 'root'
	tokens: { root: '--test-gap' }
}

type Specs = { root: TestSpecs, group: TestSpecs, input: TestSpecs }
type Args = TokensParams<TestSpecs>

const theme = { el: {} } as never
const context = { id: 'group-1' } as never

const makeArgs = (overrides: Partial<Args> = {}): Args => ({
	context: undefined as never,
	props: { size: 'sm' },
	theme,
	...overrides,
})

const makeCallback = () => {
	const result = { root: { '--test-gap': '1rem' } }
	return { result, callback: jest.fn((args: Args, name?: keyof Specs) => result) }
}

describe('getSharedTokens', () => {
	it('returns a new wrapper function, not the callback itself', () => {
		const { callback } = makeCallback()
		const tokens = getSharedTokens<Specs>(callback)

		expect(typeof tokens).toBe('function')
		expect(tokens).not.toBe(callback)
		expect(callback).not.toHaveBeenCalled()
	})

	describe('name "root"', () => {
		it('is the default name: a context makes it emit {} without calling the callback', () => {
			const { callback, result } = makeCallback()
			const tokens = getSharedTokens<Specs>(callback)

			// positive control: the same wrapper does reach the callback with no context
			expect(tokens(makeArgs())).toBe(result)
			expect(callback).toHaveBeenCalledTimes(1)

			callback.mockClear()
			expect(tokens(makeArgs({ context }))).toEqual({})
			expect(callback).not.toHaveBeenCalled()
		})

		it('emits {} for an explicit "root" when a context is present', () => {
			const { callback, result } = makeCallback()
			const tokens = getSharedTokens<Specs, 'root'>(callback, 'root')

			expect(tokens(makeArgs({ context }))).toEqual({})
			expect(callback).not.toHaveBeenCalled()

			// positive control
			expect(tokens(makeArgs())).toBe(result)
			expect(callback).toHaveBeenCalledTimes(1)
		})

		it.each([
			['undefined', undefined],
			['null', null],
		])('calls the callback once with exactly (args, "root") when context is %s', (_label, value) => {
			const { callback, result } = makeCallback()
			const tokens = getSharedTokens<Specs>(callback)
			const args = makeArgs({ context: value as never })

			const output = tokens(args)

			expect(callback).toHaveBeenCalledTimes(1)
			expect(callback.mock.calls[0]).toHaveLength(2)
			expect(callback.mock.calls[0][0]).toBe(args)
			expect(callback.mock.calls[0][1]).toBe('root')
			expect(output).toBe(result)
		})
	})

	describe.each(['group', 'input'] as const)('name "%s"', name => {
		it('reaches the callback with a context, passing the name as the second argument', () => {
			const { callback, result } = makeCallback()
			const tokens = getSharedTokens<Specs, typeof name>(callback, name)
			const args = makeArgs({ context })

			const output = tokens(args)

			expect(callback).toHaveBeenCalledTimes(1)
			expect(callback).toHaveBeenCalledWith(args, name)
			expect(callback.mock.calls[0][0]).toBe(args)
			expect(output).toBe(result)
			expect(output).not.toEqual({})
		})

		it('reaches the callback without a context, passing the name as the second argument', () => {
			const { callback, result } = makeCallback()
			const tokens = getSharedTokens<Specs, typeof name>(callback, name)
			const args = makeArgs({ context: null as never })

			const output = tokens(args)

			expect(callback).toHaveBeenCalledTimes(1)
			expect(callback).toHaveBeenCalledWith(args, name)
			expect(output).toBe(result)
			expect(output).not.toEqual({})
		})
	})

	it('runs the callback on every call and caches nothing', () => {
		const callback = jest.fn((args: Args) => ({
			root: { '--test-gap': args.props.size === 'md' ? '2rem' : '1rem' },
		}))
		const tokens = getSharedTokens<Specs>(callback)

		const small = tokens(makeArgs({ props: { size: 'sm' } }))
		const medium = tokens(makeArgs({ props: { size: 'md' } }))
		const smallAgain = tokens(makeArgs({ props: { size: 'sm' } }))

		expect(callback).toHaveBeenCalledTimes(3)
		expect(small).toEqual({ root: { '--test-gap': '1rem' } })
		expect(medium).toEqual({ root: { '--test-gap': '2rem' } })
		expect(smallAgain).toEqual({ root: { '--test-gap': '1rem' } })
		expect(smallAgain).not.toBe(small)
	})
})
