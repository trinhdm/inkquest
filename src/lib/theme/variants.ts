import { alias } from './tokens/reference'
import { deepMerge } from '@/utils/helpers'
import { tokenGenerator } from './tokens/generate'
import type { BaseVarKey, SiteTheme } from './types'
import type { CSSVariable } from '@/types/shared'
import type { TokenGroup, TokenStatesList } from './tokens/token.types'
import type { ValidSpecs } from '@/types/spec'

export type Variant =
	| 'solid' | 'outline' | 'ghost' | 'light' | 'dark'
	| 'success' | 'warning' | 'danger' | 'info'

export type Priority =
	| 'primary' | 'secondary' | 'tertiary'

type Tone =
	| 'neutral' | 'action'
	| 'danger' | 'warning' | 'success' | 'info'

interface SemanticVariantProps {
	priority?: Priority
	// variant?: Variant
}

interface ColorPalette {
	background?: TokenGroup<'backgroundColor'>
	border?: TokenGroup<'borderColor'>
	color?: TokenGroup<'color'>
}

type StateKey =
	keyof TokenStatesList<any>

type StateSuffix<K extends StateKey> =
	K extends BaseVarKey ? '' : `-${K}`

type StateVariable<
	S extends string,
	T extends keyof ColorPalette,
	K extends StateKey = StateKey
> = `--${S}-${T}${StateSuffix<K>}` extends CSSVariable
	? `--${S}-${T}${StateSuffix<K>}`
	: never

export type ColorVariable<
    S extends string,
    T extends keyof ColorPalette = keyof ColorPalette
> = StateVariable<Lowercase<S>, T>

type StateToken<V, K extends StateKey> =
	V extends Record<K, infer X>
		? X
		: K extends BaseVarKey ? V : undefined

type PaletteVars<S extends string> =
	& { [T in keyof ColorPalette as StateVariable<S, T, BaseVarKey>]-?: StateToken<ColorPalette[T], BaseVarKey> }
	& { [T in keyof ColorPalette as StateVariable<S, T, Exclude<StateKey, BaseVarKey>>]-?: StateToken<ColorPalette[T], Exclude<StateKey, BaseVarKey>> }



interface GetPaletteArgs<S extends ValidSpecs<S>> {
	prefix?: string
	theme: SiteTheme
	variant?: S['variant']
}

export type GetPaletteFn =
	<S extends ValidSpecs<S>>(args: GetPaletteArgs<S> & Omit<S['props'], 'name'> & SemanticVariantProps) => Partial<ColorPalette>

const DEFAULT_PALETTE: ColorPalette = {
	background: { base: 'transparent', hover: 'transparent' },
	border: { base: 'transparent', hover: 'transparent' },
	color: { base: 'inherit', hover: 'inherit' },
}


interface ToneAccessor {
	base: () => string
	strong: () => string
	emphasis: () => string
	subtle: () => string
	dim: () => string
}

const fromMixture = (token: typeof alias.color.danger): ToneAccessor => ({
	base: () => token(),
	strong: () => token('shade'),
	emphasis: () => token('active'),
	subtle: () => token('muted'),
	dim: () => token('dim'),
})

const TONE_ACCESSORS: Record<Tone, ToneAccessor> = {
	neutral: {
		base: () => alias.color.text(),
		strong: () => alias.border('strong'),
		emphasis: () => alias.color.action(),
		subtle: () => alias.background.card(),
		dim: () => alias.border(),
	},
	action: fromMixture(alias.accent.primary),
	danger: fromMixture(alias.color.danger),
	warning: fromMixture(alias.color.warning),
	success: fromMixture(alias.color.success),
	info: fromMixture(alias.color.info),
}

const PRIORITY_SHAPES: Record<Priority, (tone: ToneAccessor) => Partial<ColorPalette>> = {
	primary: tone => ({
		background: {
			base:	tone.base(),
			hover:	tone.emphasis(),
		},
		color: alias.color.text('on', 'accent'),
	}),
	secondary: tone => ({
		background: {
			base:	'transparent',
			hover:	alias.background.card('hover'),
		},
		border: {
			base:	tone.strong(),
			hover:	tone.emphasis(),
		},
		color: tone.base(),
	}),
	tertiary: tone => ({
		background: {
			base:	'transparent',
			hover:	tone.subtle(),
		},
		border: {
			base:	'transparent',
			hover:	tone.dim(),
		},
		color: tone.base(),
	}),
}

const SPECIAL_VARIANTS: Record<'light' | 'dark', (tone: ToneAccessor) => Partial<ColorPalette>> = {
	light: tone => ({
		background:	tone.subtle(),
		border:		'currentColor',
		color: {
			base:	tone.base(),
			hover:	alias.color.text('primary'),
		},
	}),
	dark: tone => ({
		background: tone.dim(),
		border:		tone.subtle(),
		color: {
			base:	alias.color.text('secondary'),
			hover:	alias.color.text('primary'),
		},
	}),
}

const STRUCTURAL_VARIANTS: Record<'solid' | 'outline' | 'ghost', Priority> = {
	solid: 'primary',
	outline: 'secondary',
	ghost: 'tertiary',
}

const hasVariant = <S extends ValidSpecs<S>>(
	args: GetPaletteArgs<S>
): args is GetPaletteArgs<S> & { variant: NonNullable<S['variant']> } => {
	return 'variant' in args && args.variant !== undefined
}

const getVariantColors = <S extends ValidSpecs<S>>(
	_props: GetPaletteArgs<S> & Omit<S['props'], 'name'> & SemanticVariantProps
): Partial<ColorPalette> => {
	if (!hasVariant(_props))
		return DEFAULT_PALETTE

	const { theme, priority, variant, ...props } = _props
	let tone: Tone = 'action'
	const isSpecial = variant in SPECIAL_VARIANTS,
		isStructural = variant in STRUCTURAL_VARIANTS

	if (isSpecial)
		return SPECIAL_VARIANTS[variant as keyof typeof SPECIAL_VARIANTS](TONE_ACCESSORS[tone])

	let role: Priority = priority ?? 'primary'
	tone = variant as Tone

	if (isStructural) {
		role = STRUCTURAL_VARIANTS[variant as keyof typeof STRUCTURAL_VARIANTS]
		tone = variant === 'solid' ? 'action' : 'neutral'
		console.log(role)
	}

	return PRIORITY_SHAPES[role](TONE_ACCESSORS[tone])
}


interface SetPaletteArgs<S extends string> {
    colors: ColorPalette
    name: S
}

export type SetPaletteFn =
    <S extends string>(args: SetPaletteArgs<S>) => PaletteVars<Lowercase<S>>

const setVariantColors = <S extends string>(
	{ colors, name }: SetPaletteArgs<S>
): PaletteVars<Lowercase<S>> => {
	type N = Lowercase<typeof name>
	const namespace = `${name.toLowerCase() as N}` as const,
		palette = deepMerge(DEFAULT_PALETTE, colors),
		vars = tokenGenerator(palette, namespace)

	return vars as PaletteVars<N>
}


interface PaintVariantsArgs<S extends ValidSpecs<S>, N extends string>
    extends GetPaletteArgs<S> {
    name: N
}

export type PaintVariantsFn =
	<S extends ValidSpecs<S>, N extends string>(
		args: PaintVariantsArgs<S, N> & S['props']
	) => PaletteVars<Lowercase<N>>

export const paintVariants = <S extends ValidSpecs<S>, N extends string>(
	_props: PaintVariantsArgs<S, N> & S['props']
): PaletteVars<Lowercase<N>> => {
	const { name, ...props } = _props,
		colors = getVariantColors<S>(props),
		variables = setVariantColors({ colors, name })

	return variables
}
