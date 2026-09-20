import { aliasVar, token } from './utils'
import type {
	AccentTokens, BackgroundTokens,
	BorderColorTokens, BorderRadiusTokens, ColorTokens,
	LayoutTokens, MotionTokens, SpaceTokens, TypographyTokens,
} from '../tokens'
import type { TransitionPresetTokens } from '../tokens/motion/presets'

type TextTokens = TypographyTokens['text']

// limit component usage to only shorthand tokens
export const shorthandTokens = {
	motion: token.optPath<TransitionPresetTokens>(aliasVar, 'motion'),
	// text: token.optPath<TextTokens>(aliasVar, 'text'),
	text: {
		h1: token.optPath<TextTokens>(aliasVar, 'text', 'h1'),
		h2: token.optPath<TextTokens>(aliasVar, 'text', 'h2'),
		h3: token.optPath<TextTokens>(aliasVar, 'text', 'h3'),
		h4: token.optPath<TextTokens>(aliasVar, 'text', 'h4'),
		body: token.endPath(aliasVar, 'text', 'body'),
		label: token.endPath(aliasVar, 'text', 'label'),
		control: token.endPath(aliasVar, 'text', 'control'),
		navigation: token.endPath(aliasVar, 'text', 'navigation'),
		prose: token.endPath(aliasVar, 'text', 'prose'),

		section: token.optPath<TextTokens>(aliasVar, 'text', 'section'),
		caption: token.optPath<TextTokens>(aliasVar, 'text', 'caption'),
	},
}

export type ShorthandTokens = typeof shorthandTokens
