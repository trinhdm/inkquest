import { INK_SCALE, PAPER_SCALE, LINE_HEIGHT_SCALE } from '../scales'
import type { ColorScheme } from '../../theme.types'
import type { ColorStepLabels } from '../config/types'
// import type { PrimaryTokens } from '../config/colors'
// import type { BorderColorTokens, BorderRadiusTokens } from '../config/border'
// import type { BackgroundTokens } from '../config/backgrounds'
// import type { ColorTokens } from '../config/colors'
// import type { TypographyTokens } from '../config/typography'
// import type { SpaceTokens } from '../config/space'

// // Only the types that cross reference/'s boundary live here now. Most
// // primitive-category key types (BrandStep, RadiusStep, FontWeightStep,
// // FontFamilyKey, DurationKey, EaseKey — six of them) used to be hand-typed
// // here; they're gone, not moved — accessors.ts's mapped types now derive
// // them automatically from scale-registry.ts, and nothing outside tkn.ts's
// // own construction ever needed to name them directly.

/** Needed externally: builder/theme-config.ts, background.ts, border.ts, colors.ts all type a `paletteName` field with this. */
export type PaletteName = Extract<ColorScheme, 'ink' | 'paper'>

/** Needed externally: builder/theme-config.ts's ThemeConfig.background.{page,cardBase} are typed with this. */
export type ColorScaleStep = ColorStepLabels<typeof INK_SCALE> | ColorStepLabels<typeof PAPER_SCALE>

/** Needed by primitive.ts's own hand-kept lineHeight accessor. */
export type LineHeightKey = keyof typeof LINE_HEIGHT_SCALE

/** Needed by primitive.ts's own hand-kept size accessor — generated (1x-24x baseSize) at runtime, not enumerable from a fixed list. */
export type SizeStep = `${number}`

// // Semantic/alias state keys — derived from the real built-token interfaces,
// // not from a separately maintained list.
// export type PrimaryStateKey = Exclude<keyof PrimaryTokens, 'base'>
// export type BorderStateKey = Exclude<keyof BorderColorTokens, 'base'>
// export type CardStateKey = Exclude<keyof BackgroundTokens['card'], 'base'>

// export type LinkColorStateKey = Exclude<keyof ColorTokens['link'], 'base'>
// export type InteractiveColorStateKey = Exclude<keyof ColorTokens['interactive'], 'base'>
// export type TextColorStateKey = Exclude<keyof ColorTokens['text'], 'base'>
// export type ActionColorStateKey = Exclude<keyof ColorTokens['action'], 'base'>

// // export type FontFamilyAliasKey = keyof TypographyTokens['family']
// // export type LineHeightAliasKey = keyof TypographyTokens['lineHeight']
// // export type FontSizeAliasKey = keyof TypographyTokens['size']
// // export type FontWeightAliasKey = keyof TypographyTokens['weight']

// // Static-token key types — alias.space.inset(...) / alias.radius(...) read
// // these the same way the state keys above read their config/*.ts interfaces.
// export type SpaceInsetKey = keyof SpaceTokens['inset']
// export type BorderRadiusKey = keyof BorderRadiusTokens
