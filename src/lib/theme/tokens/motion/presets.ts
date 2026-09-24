import { alias } from '../../reference'

export interface TransitionPresetTokens {
	box: string
	colors: string
}

export const getTransitionPresetTokens = (): TransitionPresetTokens => ({
	box: `${alias.transition.background()},
		${alias.transition.border()}`,
	colors: `${alias.transition.background()},
		${alias.transition.border()},
		${alias.transition.color()}`,
})
