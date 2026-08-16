import { alias, base } from '../../reference'
import { colorMix } from '../utils'

export interface PrimaryTokens {
	base: string
	hover: string
	press: string
	muted: string
	text: string
}

export const getPrimaryTokens = (): PrimaryTokens => ({
	base: base.brand('100'),
	hover: base.brand('200'),
	press: base.brand('300'),
	muted: colorMix(alias.background.page(), 80, alias.accent.primary()),
	text: alias.color.link(),
})
