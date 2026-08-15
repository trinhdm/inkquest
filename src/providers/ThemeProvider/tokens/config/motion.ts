import { tokn } from '../ref'

export interface MotionTokens {
	interactive: string
}

export const motionTokens = (): MotionTokens => ({
	interactive: `background-color ${tokn.duration('fast')} ${tokn.ease()},
	border-color ${tokn.duration('fast')},
	transform ${tokn.duration('instant')} ${tokn.ease()}`,
})
