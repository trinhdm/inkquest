import { getChildKey } from '../getChildKey'
import { Named } from './utils'

describe('getChildKey', () => {
	it('returns the element key when the element has an explicit key', () => {
		const child = <Named key="explicit-key">content</Named>
		expect(getChildKey(child, 3)).toBe('explicit-key')
	})

	it('falls back to the index when the element has no key', () => {
		const child = <Named>content</Named>
		expect(getChildKey(child, 2)).toBe(2)
	})

	it('falls back to the index for a plain string child (not a valid element)', () => {
		expect(getChildKey('just text', 0)).toBe(0)
	})

	it('falls back to the index for null', () => {
		expect(getChildKey(null, 5)).toBe(5)
	})
})
