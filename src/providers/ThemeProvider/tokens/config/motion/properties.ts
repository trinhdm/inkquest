import { base } from '../../reference'

export interface TransitionPropertyTokens {
	background: string
	border: string
	color: string
	transform: string
}

export const getTransitionPropertyTokens = (): TransitionPropertyTokens => ({
	background:		`background-color ${base.duration('fast')} ${base.ease()}`,
	border:			`border-color ${base.duration('fast')} ${base.ease()}`,
	color:			`color ${base.duration('fast')} ${base.ease()}`,
	transform:		`transform ${base.duration('instant')} ${base.ease()}`,
})
