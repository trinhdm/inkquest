import { alias, tokn } from '../../ref'
import { colorMix } from '../utils'

export interface SecondaryTokens {
	base: string
	// hover: string
	// press: string
	// muted: string
	// text: string
}

export const getSecondaryTokens = (): SecondaryTokens => ({
	base: tokn.brand('100'),
	// hover: tokn.brand('200'),
	// press: tokn.brand('300'),
	// muted: colorMix(alias.background.page(), 80, alias.primary()),
	// text: alias.color.link(),
})
