import type { TokenStatesList } from '../token.types'

export interface ColorMixtures
	extends TokenStatesList<'color'> {
	base: string
	bright: string
	dim: string
	muted: string
	shade: string
	tint: string
}

export type { AccentTokens } from './accent'
export type { BackgroundTokens } from './background'
export type { BorderColorTokens, BorderRadiusTokens } from './border'
export type { ColorTokens } from './colors'
export type { MotionTokens } from './motion'
export type { SpaceTokens } from './layout'
export type { TypographyTokens } from './typography'
