import { Fragment } from 'react'
import { countChildren } from '../countChildren'
import { filterChildren } from '../filterChildren'
import { Anonymous, Named, OtherNamed } from './utils'

describe('filterChildren', () => {
	let warn: jest.SpyInstance

	beforeEach(() => { warn = jest.spyOn(console, 'warn').mockImplementation(() => {}) })
	afterEach(() => { warn.mockRestore() })

	it('keeps only children whose component displayName matches the given string', () => {
		const result = filterChildren(
			[<Named key="a">a</Named>, <OtherNamed key="b">b</OtherNamed>],
			'Named'
		)

		expect(result).toHaveLength(1)
	})

	it('keeps children whose displayName is included in a given array of names', () => {
		const result = filterChildren(
			[<Named key="a">a</Named>, <OtherNamed key="b">b</OtherNamed>],
			['Named', 'OtherNamed']
		)

		expect(result).toHaveLength(2)
	})

	describe('array of names', () => {
		it('excludes children whose displayName is not in the list', () => {
			const result = filterChildren(
				[<Named key="a">a</Named>, <OtherNamed key="b">b</OtherNamed>],
				['OtherNamed']
			)

			expect(result).toHaveLength(1)
			expect(result[0]).toMatchObject({ type: OtherNamed })
		})

		it('returns one slot per name, in the order of the names, regardless of child order', () => {
			const result = filterChildren(
				[<OtherNamed key="b">b</OtherNamed>, <Named key="a">a</Named>],
				['Named', 'OtherNamed']
			)

			expect(result[0]).toMatchObject({ type: Named })
			expect(result[1]).toMatchObject({ type: OtherNamed })
		})

		it('leaves a null slot for a name that has no matching child', () => {
			const result = filterChildren([<Named key="a">a</Named>], ['Named', 'OtherNamed'])

			expect(result).toHaveLength(2)
			expect(result[0]).toMatchObject({ type: Named })
			expect(result[1]).toBeNull()
		})

		it('keeps the first of two children sharing a name', () => {
			const result = filterChildren(
				[<Named key="a">first</Named>, <Named key="b">second</Named>],
				['Named']
			)

			expect(result).toHaveLength(1)
			expect(result[0]).toMatchObject({ props: { children: 'first' } })
		})

		it('finds named children inside a Fragment', () => {
			const result = filterChildren(
				<><OtherNamed>b</OtherNamed><Named>a</Named></>,
				['Named', 'OtherNamed']
			)

			expect(result[0]).toMatchObject({ type: Named })
			expect(result[1]).toMatchObject({ type: OtherNamed })
		})

		it('warns when a named child is missing and total expects them all', () => {
			filterChildren([<Named key="a">a</Named>], ['Named', 'OtherNamed'], { name: 'Pair', total: 2 })

			expect(warn).toHaveBeenCalledWith('Pair: 1 children found; a Pair needs exactly 2 children.')
		})

		it('stays silent when every named child is present', () => {
			filterChildren(
				[<Named key="a">a</Named>, <OtherNamed key="b">b</OtherNamed>],
				['Named', 'OtherNamed'],
				{ name: 'Pair', total: 2 }
			)

			expect(warn).not.toHaveBeenCalled()
		})

		it('drops an unrelated child beside the named ones and warns about it, without counting it', () => {
			const result = filterChildren(
				[<Named key="a">a</Named>, <OtherNamed key="b">b</OtherNamed>, <div key="x">x</div>],
				['Named', 'OtherNamed'],
				{ name: 'Pair', total: 2 }
			)

			expect(result).toHaveLength(2)
			expect(warn).toHaveBeenCalledTimes(1)
			expect(warn).toHaveBeenCalledWith('Pair: ignoring unrelated <div>.')
		})

		// a repeat is still dropped (the first match keeps its slot), but now warns
		it('drops a repeated named child, keeping the first, and warns about it', () => {
			const result = filterChildren(
				[<Named key="a">first</Named>, <Named key="b">second</Named>, <OtherNamed key="c">c</OtherNamed>],
				['Named', 'OtherNamed'],
				{ name: 'Pair', total: 2 }
			)

			expect(result[0]).toMatchObject({ props: { children: 'first' } })
			expect(warn).toHaveBeenCalledTimes(1)
			expect(warn).toHaveBeenCalledWith('Pair: ignoring repeated Named; only the first is rendered.')
		})

		it('catches a repeat hidden inside a Fragment', () => {
			filterChildren(
				[<Named key="a">a</Named>, <Fragment key="f"><Named>b</Named><OtherNamed>c</OtherNamed></Fragment>],
				['Named', 'OtherNamed'],
				{ name: 'Pair', total: 2 }
			)

			expect(warn).toHaveBeenCalledTimes(1)
			expect(warn).toHaveBeenCalledWith('Pair: ignoring repeated Named; only the first is rendered.')
		})
	})

	it('drops elements whose component has no displayName at all', () => {
		const result = filterChildren([<Anonymous key="a">a</Anonymous>], 'Named')
		expect(result).toHaveLength(0)
	})

	// non-element children are dropped on purpose: only matching elements survive
	it('drops non-element children (strings, numbers), keeping the matching element beside them', () => {
		const result = filterChildren(['plain text', 42, <Named key="a">a</Named>], 'Named')

		expect(result).toHaveLength(1)
		expect(result[0]).toMatchObject({ type: Named })
	})

	it('recurses into a Fragment and filters its children by the same displayName rule', () => {
		const result = filterChildren(
			<>
				<Named key="a">a</Named>
				<OtherNamed key="b">b</OtherNamed>
			</>,
			'Named'
		)

		expect(result).toHaveLength(1)
		expect(result[0]).toMatchObject({ type: Named })
	})

	it('recurses into nested Fragments', () => {
		const result = filterChildren(
			<><><Named>a</Named></><Named>b</Named></>,
			'Named'
		)

		expect(result).toHaveLength(2)
	})

	it('keeps filterChildren and countChildren in agreement on a Fragment-wrapped tree', () => {
		const children = <><Named>a</Named><Named>b</Named></>

		expect(filterChildren(children, 'Named')).toHaveLength(countChildren(children, 'Named'))
	})

	it('returns an empty array when given no children', () => {
		expect(filterChildren(null, 'Named')).toEqual([])
		expect(filterChildren(undefined, 'Named')).toEqual([])
	})

	it('ignores falsy conditional siblings', () => {
		const result = filterChildren([<Named key="a">a</Named>, false, null, undefined], 'Named')
		expect(result).toHaveLength(1)
	})

	it('excludes everything when nothing matches the requested displayName', () => {
		const result = filterChildren([<Named key="a">a</Named>], 'DoesNotExist')
		expect(result).toEqual([])
	})

	describe('verifyArgs', () => {
		it('counts only the matches, and reports the rest as unrelated', () => {
			filterChildren(
				[<Named key="a">a</Named>, <OtherNamed key="b">b</OtherNamed>, 'loose text'],
				'Named',
				{ name: 'Host', total: 1 }
			)

			expect(warn).toHaveBeenCalledTimes(1)
			expect(warn).toHaveBeenCalledWith('Host: ignoring unrelated OtherNamed, loose text.')
		})

		it('does not report whitespace-only text, such as a stray space between tags', () => {
			// positive control: real text in the same spot is reported
			filterChildren([<Named key="a">a</Named>, 'x'], 'Named', { name: 'Host' })
			expect(warn).toHaveBeenCalledTimes(1)
			warn.mockClear()

			filterChildren([' ', <Named key="a">a</Named>, '\n\t '], 'Named', { name: 'Host' })
			expect(warn).not.toHaveBeenCalled()
		})

		it('keeps every match in single-name mode, so repeats are not reported', () => {
			const result = filterChildren([<Named key="a">a</Named>, <Named key="b">b</Named>], 'Named', { name: 'Host' })

			expect(result).toHaveLength(2)
			expect(warn).not.toHaveBeenCalled()
		})

		it('does not report a falsy conditional as unrelated', () => {
			// positive control: a real non-matching child in the same spot is reported
			filterChildren([<Named key="a">a</Named>, <OtherNamed key="b">b</OtherNamed>], 'Named', { name: 'Host' })
			expect(warn).toHaveBeenCalledTimes(1)
			warn.mockClear()

			filterChildren([<Named key="a">a</Named>, false, null], 'Named', { name: 'Host' })
			expect(warn).not.toHaveBeenCalled()
		})

		it('warns when the number of matches breaks total', () => {
			filterChildren(
				[<Named key="a">a</Named>, <Named key="b">b</Named>],
				'Named',
				{ name: 'Host', total: 1 }
			)

			expect(warn).toHaveBeenCalledWith('Host: 2 children found; a Host needs exactly 1 children.')
		})

		it('warns when the number of matches exceeds max', () => {
			filterChildren(
				[<Named key="a">a</Named>, <Named key="b">b</Named>],
				'Named',
				{ name: 'Host', max: 1 }
			)

			expect(warn).toHaveBeenCalledWith('Host: 2 children found; a Host needs less than 2 children.')
		})

		it('warns nothing when no verifyArgs are given, even with unrelated children', () => {
			filterChildren([<Named key="a">a</Named>, <OtherNamed key="b">b</OtherNamed>, 'loose text'], 'Named')
			expect(warn).not.toHaveBeenCalled()
		})
	})
})
