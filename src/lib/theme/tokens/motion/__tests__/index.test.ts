import { getMotionTokens } from '../index'
import { getTransitionPropertyTokens } from '../transitions/properties'
import { getTransitionPresetTokens } from '../presets'

describe('getMotionTokens', () => {
	it('merges the property and preset transitions into one flat map', () => {
		expect(getMotionTokens()).toEqual({
			...getTransitionPropertyTokens(),
			...getTransitionPresetTokens(),
		})
	})

	it('loses no keys to collisions', () => {
		expect(Object.keys(getMotionTokens())).toHaveLength(
			Object.keys(getTransitionPropertyTokens()).length
			+ Object.keys(getTransitionPresetTokens()).length
		)
	})
})
