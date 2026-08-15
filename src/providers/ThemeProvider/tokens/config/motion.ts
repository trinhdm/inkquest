import { alias, tokn } from '../ref'

interface TransitionPropertyTokens {
	background: string
	border: string
	color: string
	transform: string
}

interface TransitionPresetTokens {
	interactive: string
}

export interface MotionTokens
	extends TransitionPropertyTokens, TransitionPresetTokens {}

const transitionPropertyTokens = (): TransitionPropertyTokens => ({
	background:		`background-color ${tokn.duration('fast')} ${tokn.ease()}`,
	border:			`border-color ${tokn.duration('fast')} ${tokn.ease()}`,
	color:			`color ${tokn.duration('fast')} ${tokn.ease()}`,
	transform:		`transform ${tokn.duration('instant')} ${tokn.ease()}`,
})

const transitionPresetTokens = (): TransitionPresetTokens => ({
	interactive: `${alias.transition.background()}, ${alias.transition.border()}`,
})

export const motionTokens = (): MotionTokens => {
	const transitionProperties = transitionPropertyTokens(),
		transitionPresets = transitionPresetTokens()

	return { ...transitionProperties, ...transitionPresets }
}
