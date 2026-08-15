import { aliasVar } from './shared'
import { createAccessor, createStateAccessor, createValueRef } from './accessor'
import type { PrimaryTokens } from '../config/colors'
import type { BorderColorTokens, BorderRadiusTokens } from '../config/border'
import type { BackgroundTokens } from '../config/backgrounds'
import type { ColorTokens } from '../config/colors'
import type { SpaceTokens } from '../config/space'
import type { TypographyTokens } from '../config/typography'

/** References into already-built semantic tokens. Nesting mirrors config/'s composition — a new semantic category needs a matching entry here. */

const themeTokens = {
	theme: createValueRef(aliasVar, 'theme'),
	primary: createStateAccessor<PrimaryTokens>(aliasVar, 'primary'),
}

const propertyTokens = {
	border: createStateAccessor<BorderColorTokens>(aliasVar, 'border'),
	borderRadius: createAccessor<BorderRadiusTokens>(aliasVar, 'border', 'radius'),

	fontFamily: createAccessor<TypographyTokens['fontFamily']>(aliasVar, 'font', 'fontFamily'),
	fontSize: createAccessor<TypographyTokens['fontSize']>(aliasVar, 'font', 'fontSize'),
	fontWeight: createAccessor<TypographyTokens['fontWeight']>(aliasVar, 'font', 'fontWeight'),
	lineHeight: createAccessor<TypographyTokens['lineHeight']>(aliasVar, 'font', 'lineHeight'),

	transition: {
		background: createValueRef(aliasVar, 'motion', 'background'),
		border: createValueRef(aliasVar, 'motion', 'border'),
		color: createValueRef(aliasVar, 'motion', 'color'),
		transform: createValueRef(aliasVar, 'motion', 'transform'),
	},
}
export const alias = {
	...themeTokens,
	...propertyTokens,
	background: {
		page: createValueRef(aliasVar, 'background', 'page'),
		card: createStateAccessor<BackgroundTokens['card']>(aliasVar, 'background', 'card'),
	},
	color: {
		text: createStateAccessor<ColorTokens['text']>(aliasVar, 'color', 'text'),
		link: createStateAccessor<ColorTokens['link']>(aliasVar, 'color', 'link'),
		action: createStateAccessor<ColorTokens['action']>(aliasVar, 'color', 'action'),
		interactive: createStateAccessor<ColorTokens['interactive']>(aliasVar, 'color', 'interactive'),
	},
	font: {
		display: createValueRef(aliasVar, 'font', 'display'),
		title: createValueRef(aliasVar, 'font', 'title'),
		body: createValueRef(aliasVar, 'font', 'body'),
		label: createValueRef(aliasVar, 'font', 'label'),
	},
	space: {
		inset: createAccessor<SpaceTokens['inset']>(aliasVar, 'space', 'inset'),
	},
	motion: {
		interactive: createValueRef(aliasVar, 'motion', 'interactive'),
	},
}

/** The shape useTheme() exposes to components — see SiteTheme.alias in theme.types.ts. */
export type AliasTokens = typeof alias
