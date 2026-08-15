import { aliasVar } from './shared'
import { createAccessor, createStateAccessor, createValueRef } from './accessor'
import type {
	AccentStateKey, BorderStateKey, CardStateKey,
	LinkColorStateKey, InteractiveColorStateKey,
	FontFamilyAliasKey, FontWeightAliasKey,
	SpaceInsetKey, BorderRadiusKey,
	ActionColorStateKey,
	TextColorStateKey,
} from './keys'

/** References into already-built semantic tokens. Nesting mirrors config/'s composition — a new semantic category needs a matching entry here. */
export const alias = {
	theme: createValueRef(aliasVar, 'theme'),
	accent: createStateAccessor<AccentStateKey>(aliasVar, 'accent'),
	border: createStateAccessor<BorderStateKey>(aliasVar, 'border'),
	background: {
		page: createValueRef(aliasVar, 'background', 'page'),
		card: createStateAccessor<CardStateKey>(aliasVar, 'background', 'card'),
	},
	color: {
		text: createStateAccessor<TextColorStateKey>(aliasVar, 'color', 'text'),
		link: createStateAccessor<LinkColorStateKey>(aliasVar, 'color', 'link'),
		action: createStateAccessor<ActionColorStateKey>(aliasVar, 'color', 'action'),
		interactive: createStateAccessor<InteractiveColorStateKey>(aliasVar, 'color', 'interactive'),
	},
	font: {
		family: createAccessor<FontFamilyAliasKey>(aliasVar, 'font', 'family'),
		weight: createAccessor<FontWeightAliasKey>(aliasVar, 'font', 'weight'),
		display: createValueRef(aliasVar, 'font', 'display'),
		title: createValueRef(aliasVar, 'font', 'title'),
		body: createValueRef(aliasVar, 'font', 'body'),
		label: createValueRef(aliasVar, 'font', 'label'),
	},
	space: {
		inset: createAccessor<SpaceInsetKey>(aliasVar, 'space', 'inset'),
	},
	radius: createAccessor<BorderRadiusKey>(aliasVar, 'border', 'radius'),
	motion: {
		interactive: createValueRef(aliasVar, 'motion', 'interactive'),
	},
}

/** The shape useTheme() exposes to components — see SiteTheme.alias in theme.types.ts. */
export type AliasTokens = typeof alias
