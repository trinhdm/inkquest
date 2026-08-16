import { alias } from '../../reference'

export interface TransitionPresetTokens {
	interactive: string
}

export const getTransitionPresetTokens = (): TransitionPresetTokens => ({
	interactive: `${alias.transition.background()}, ${alias.transition.border()}`,
})
