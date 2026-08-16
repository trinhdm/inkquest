import { alias } from '../../ref'

export interface TransitionPresetTokens {
	interactive: string
}

export const getTransitionPresetTokens = (): TransitionPresetTokens => ({
	interactive: `${alias.transition.background()}, ${alias.transition.border()}`,
})
