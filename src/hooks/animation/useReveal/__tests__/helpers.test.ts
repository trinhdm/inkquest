import { revealItem, revealItemFrom, REVEAL_DATAKEYS } from '../helpers'

describe('revealItem', () => {
	it('stringifies the index onto the child reveal data-key by default', () => {
		expect(revealItem(3)).toEqual({ [REVEAL_DATAKEYS.child]: '3' })
	})

	it('stringifies index 0 rather than treating it as falsy/omitted', () => {
		expect(revealItem(0)).toEqual({ 'data-reveal-item': '0' })
	})

	it('writes to a custom target key when one is given', () => {
		expect(revealItem(2, 'data-custom-key' as typeof REVEAL_DATAKEYS.child)).toEqual({
			'data-custom-key': '2',
		})
	})
})

describe('revealItemFrom', () => {
	it('offsets the index by `from` when `from` is a number', () => {
		expect(revealItemFrom(2, 5)).toEqual({ [REVEAL_DATAKEYS.child]: '7' })
	})

	it('treats `from: 0` as a valid reserved range start, not as "no range"', () => {
		expect(revealItemFrom(3, 0)).toEqual({ [REVEAL_DATAKEYS.child]: '3' })
	})

	it('returns an empty object when `from` is undefined (parent not animated)', () => {
		expect(revealItemFrom(2, undefined)).toEqual({})
	})

	it('returns an empty object when `from` is omitted entirely', () => {
		expect(revealItemFrom(2)).toEqual({})
	})
})
