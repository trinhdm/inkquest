import { getTransitionPresetTokens, type TransitionPresetTokens } from './presets'
import { getTransitionPropertyTokens, type TransitionPropertyTokens } from './properties'

export interface MotionTokens
	extends TransitionPropertyTokens, TransitionPresetTokens {}

export const getMotionTokens = (): MotionTokens => {
	const transitionProperties = getTransitionPropertyTokens(),
		transitionPresets = getTransitionPresetTokens()

	return { ...transitionProperties, ...transitionPresets }
}
