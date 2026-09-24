import { getTransitionPresetTokens, type TransitionPresetTokens } from '../presets'
import { getTransitionPropertyTokens, type TransitionPropertyTokens } from './properties'

export interface TransitionTokens
	extends TransitionPropertyTokens, TransitionPresetTokens {}

export const getTransitionTokens = (): TransitionTokens => {
	const transitionProperties = getTransitionPropertyTokens(),
		transitionPresets = getTransitionPresetTokens()

	return { ...transitionProperties, ...transitionPresets }
}
