import { aliasVar, token } from './utils'
import type {
	AccentTokens, BackgroundTokens,
	BorderColorTokens, BorderRadiusTokens, ColorTokens,
	SpaceTokens, TypographyTokens
} from '../tokens'

const themeTokens = {
	theme: token.endPath(aliasVar, 'theme'),
	accent: {
		primary: token.optPath<AccentTokens['primary']>(aliasVar, 'accent', 'primary'),
		secondary: token.optPath<AccentTokens['secondary']>(aliasVar, 'accent', 'secondary'),
	}
}

const propertyTokens = {
	border: token.optPath<BorderColorTokens>(aliasVar, 'border'),
	borderRadius: token.path<BorderRadiusTokens>(aliasVar, 'border', 'radius'),

	fontFamily: token.path<TypographyTokens['fontFamily']>(aliasVar, 'font', 'family'),
	fontSize: token.path<TypographyTokens['fontSize']>(aliasVar, 'font', 'size'),
	fontWeight: token.path<TypographyTokens['fontWeight']>(aliasVar, 'font', 'weight'),
	lineHeight: token.path<TypographyTokens['lineHeight']>(aliasVar, 'font', 'lineHeight'),

	transition: {
		background: token.endPath(aliasVar, 'motion', 'background'),
		border: token.endPath(aliasVar, 'motion', 'border'),
		color: token.endPath(aliasVar, 'motion', 'color'),
		transform: token.endPath(aliasVar, 'motion', 'transform'),
	},
}

export const semanticTokens = {
	background: {
		page: token.endPath(aliasVar, 'background', 'page'),
		card: token.optPath<BackgroundTokens['card']>(aliasVar, 'background', 'card'),
	},
	color: {
		text: token.optPath<ColorTokens['text']>(aliasVar, 'color', 'text'),
		link: token.optPath<ColorTokens['link']>(aliasVar, 'color', 'link'),
		action: token.optPath<ColorTokens['action']>(aliasVar, 'color', 'action'),
		danger: token.optPath<ColorTokens['danger']>(aliasVar, 'color', 'danger'),
		success: token.optPath<ColorTokens['success']>(aliasVar, 'color', 'success'),
		warning: token.optPath<ColorTokens['warning']>(aliasVar, 'color', 'warning'),
		info: token.optPath<ColorTokens['info']>(aliasVar, 'color', 'info'),
	},
	font: {
		display: token.endPath(aliasVar, 'font', 'display'),
		title: token.endPath(aliasVar, 'font', 'title'),
		body: token.endPath(aliasVar, 'font', 'body'),
		label: token.endPath(aliasVar, 'font', 'label'),
	},
	space: {
		inset: token.path<SpaceTokens['inset']>(aliasVar, 'space', 'inset'),
	},
	motion: {
		interactive: token.endPath(aliasVar, 'motion', 'interactive'),
	},
}

/** References into already-built semantic tokens. Nesting mirrors config/'s composition — a new semantic category needs a matching entry here. */
export const aliasTokens = {
	...themeTokens,
	...propertyTokens,
	...semanticTokens,
}

/** The shape useTheme() exposes to components — see SiteTheme.alias in theme.types.ts. */
export type SemanticTokens = typeof semanticTokens
