import { aliasVar } from './shared'
import { createAccessor, createStateAccessor } from './accessors'
import type {
	AccentStateKey, BorderStateKey, CardStateKey,
	LinkColorStateKey, InteractiveColorStateKey,
	FontFamilyAliasKey, FontWeightAliasKey,
} from './keys'

/**
 * References into already-built semantic tokens, replacing the old
 * Token.alias('category', 'key') call style. Nesting mirrors the real shape
 * of SemanticTheme (builder/semantic/index.ts) — a new semantic category
 * needs a matching entry here, same as it already needs one in
 * semantic/index.ts's composition. Only categories actually referenced
 * elsewhere are listed (extending this is cheap and additive).
 *
 * Unlike tkn (see tkn.ts), this isn't built from a runtime registry: its
 * categories are anchored in TypeScript interfaces (AccentTokens,
 * BorderTokens, ...) that describe what builder/semantic/*.ts's functions
 * return — interfaces don't exist at runtime, so there's nothing to iterate
 * over. Each line below is already about as small as it can get: a name, a
 * path, and a key type pulled from the one real interface that defines it.
 */
export const alias = {
	accent: createStateAccessor<AccentStateKey>(aliasVar, 'accent'),
	border: createStateAccessor<BorderStateKey>(aliasVar, 'border'),
	background: {
		card: createStateAccessor<CardStateKey>(aliasVar, 'background', 'card'),
	},
	color: {
		link: createStateAccessor<LinkColorStateKey>(aliasVar, 'color', 'link'),
		interactive: createStateAccessor<InteractiveColorStateKey>(aliasVar, 'color', 'interactive'),
	},
	// Distinct from tkn.font (raw family primitives: black/sans/mono) — these
	// alias the semantic typography tokens built in builder/typography.ts.
	font: {
		family: createAccessor<FontFamilyAliasKey>(aliasVar, 'font', 'family'),
		weight: createAccessor<FontWeightAliasKey>(aliasVar, 'font', 'weight'),
	},
}
