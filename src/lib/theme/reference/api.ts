import { aliasVar, token } from './utils'
import { aliasTokens } from './semantic'
import type { LayoutTokens, TypographyTokens } from '../tokens'
import type { TransitionPresetTokens } from '../tokens/motion/presets'

type UITokens<T extends keyof LayoutTokens> = ReturnType<LayoutTokens[T]>
type TextTokens = TypographyTokens['text']

// limit component usage to only shorthand tokens
const shorthandTokens = {
	motion: token.optPath<TransitionPresetTokens>(aliasVar, 'motion'),
	text: {
		h1: token.optPath<TextTokens['h1']>(aliasVar, 'text', 'h1'),
		h2: token.optPath<TextTokens['h2']>(aliasVar, 'text', 'h2'),
		h3: token.optPath<TextTokens['h3']>(aliasVar, 'text', 'h3'),
		h4: token.optPath<TextTokens['h4']>(aliasVar, 'text', 'h4'),
		body: token.endPath(aliasVar, 'text', 'body'),
		label: token.endPath(aliasVar, 'text', 'label'),
		control: token.endPath(aliasVar, 'text', 'control'),
		navigation: token.endPath(aliasVar, 'text', 'navigation'),
		prose: token.endPath(aliasVar, 'text', 'prose'),

		section: token.optPath<TextTokens['section']>(aliasVar, 'text', 'section'),
		caption: token.optPath<TextTokens['caption']>(aliasVar, 'text', 'caption'),
	},
}

const componentTokens = {
	el: {
		field: {
			padding: token.path<UITokens<'grid'>['field']['padding']>(aliasVar, 'field', 'padding'),
		},
		icon: {
			size: token.path<UITokens<'element'>['icon']>(aliasVar, 'icon'),
		},
	},
} as const

const propertyTokens = {
	fontSize: aliasTokens.fontSize,
	letterSpacing: aliasTokens.letterSpacing,
	padding: token.path<UITokens<'padding'>>(aliasVar, 'pad'),
} as const

export const apiTokens = {
	...componentTokens,
	...propertyTokens,
	presets: shorthandTokens,
	space: aliasTokens.space,
}

/** The shape useTheme() exposes to components — see SiteTheme.alias in theme.types.ts. */
export type ApiTokens = typeof apiTokens
