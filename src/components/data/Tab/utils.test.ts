import { getTabIds } from './utils'

describe('getTabIds', () => {
	it('derives a control id and a panel id from the group uid and index', () => {
		expect(getTabIds('tab-abc', 2)).toEqual({ control: 'tab-abc-2', panel: 'tab-abc-2-panel' })
	})

	it('gives different indexes different ids, and the same input the same ids', () => {
		expect(getTabIds('u', 0)).not.toEqual(getTabIds('u', 1))
		expect(getTabIds('u', 1)).toEqual(getTabIds('u', 1))
	})

	it('keeps index 0 rather than treating it as missing', () => {
		expect(getTabIds('u', 0).control).toBe('u-0')
	})
})
