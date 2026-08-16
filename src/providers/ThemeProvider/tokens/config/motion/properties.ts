import { tokn } from '../../ref'

export interface TransitionPropertyTokens {
	background: string
	border: string
	color: string
	transform: string
}

export const getTransitionPropertyTokens = (): TransitionPropertyTokens => ({
	background:		`background-color ${tokn.duration('fast')} ${tokn.ease()}`,
	border:			`border-color ${tokn.duration('fast')} ${tokn.ease()}`,
	color:			`color ${tokn.duration('fast')} ${tokn.ease()}`,
	transform:		`transform ${tokn.duration('instant')} ${tokn.ease()}`,
})
