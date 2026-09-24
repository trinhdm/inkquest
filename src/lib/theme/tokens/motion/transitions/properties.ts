import { base } from '../../../reference'

export interface TransitionPropertyTokens {
	background: string
	border: string
	color: string
	opacity: string
	transform: string
}

export const getTransitionPropertyTokens = (): TransitionPropertyTokens => ({
	background:		`background-color ${base.duration('default')} ${base.easing()}`,
	border:			`border-color ${base.duration('default')} ${base.easing()}`,
	color:			`color ${base.duration('default')} ${base.easing()}`,
	opacity:		`opacity ${base.duration('instant')} ${base.easing()}`,
	transform:		`transform ${base.duration('instant')} ${base.easing()}`,
})
