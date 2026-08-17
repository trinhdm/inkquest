import { alias } from '../reference'
import { deepMerge } from '@/utils/helpers'
import { tokenGenerator } from '../generate'
import type { ValidSpecs } from '@/types/spec'
import type {
	Priority, Tone, Variant,
	PaletteTokens, VariantTokens,
	SemanticVariantProps, SiteTheme,
} from '../types'

interface GetPaletteArgs<S extends ValidSpecs<S>> {
	prefix?: string
	theme: SiteTheme
	variant?: S['variant']
}

export type GetPaletteFn =
	<S extends ValidSpecs<S>>(args: GetPaletteArgs<S> & Omit<S['props'], 'name'> & SemanticVariantProps) => Partial<VariantTokens>

const DEFAULT_PALETTE: VariantTokens = {
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

const PRIORITY_SHAPES: Record<Priority, (tone: ToneAccessor) => Partial<VariantTokens>> = {
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

const SPECIAL_VARIANTS: Record<'light' | 'dark', (tone: ToneAccessor) => Partial<VariantTokens>> = {
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
			base:	tone.emphasis(),
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

export type GetVariantColorsFn =
	<S extends ValidSpecs<S>>(
		_props: GetPaletteArgs<S> & Omit<S['props'], 'name'> & SemanticVariantProps
	) => Partial<VariantTokens>

export const getVariantColors = <S extends ValidSpecs<S>>(
	_props: GetPaletteArgs<S> & Omit<S['props'], 'name'> & SemanticVariantProps
): Partial<VariantTokens> => {
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
	}

	return PRIORITY_SHAPES[role](TONE_ACCESSORS[tone])
}


interface SetPaletteArgs<S extends string> {
    colors: VariantTokens
    name: S
}

export type SetPaletteFn =
    <S extends string>(args: SetPaletteArgs<S>) => PaletteTokens<Lowercase<S>>

const setVariantColors = <S extends string>(
	{ colors, name }: SetPaletteArgs<S>
): PaletteTokens<Lowercase<S>> => {
	type N = Lowercase<typeof name>
	const namespace = `${name.toLowerCase() as N}` as const,
		palette = deepMerge(DEFAULT_PALETTE, colors),
		vars = tokenGenerator(palette, namespace)

	return vars as PaletteTokens<N>
}


interface PaintVariantsArgs<S extends ValidSpecs<S>, N extends string>
    extends GetPaletteArgs<S> {
    name: N
}

export type PaintVariantsFn =
	<S extends ValidSpecs<S>, N extends string>(
		args: PaintVariantsArgs<S, N> & S['props']
	) => PaletteTokens<Lowercase<N>>

export const paintVariants = <S extends ValidSpecs<S>, N extends string>(
	_props: PaintVariantsArgs<S, N> & S['props']
): PaletteTokens<Lowercase<N>> => {
	const { name, ...props } = _props,
		colors = getVariantColors<S>(props),
		variables = setVariantColors({ colors, name })

	return variables
}


export interface VariantPaletteEntry {
	variant: Variant
	priority?: Priority
	palette: Partial<VariantTokens>
}

const combinePalettes = (palette: Partial<VariantTokens>) =>
	deepMerge(DEFAULT_PALETTE, palette)

export const enumerateVariantPalettes = (): VariantPaletteEntry[] => {
	const semanticTones = ['danger', 'warning', 'success', 'info'] as const
	const priorities = ['primary', 'secondary', 'tertiary'] as const

	const semantic = semanticTones.flatMap(tone =>
		priorities.map(priority => ({
			variant: tone as Variant,
			priority,
			palette: combinePalettes(PRIORITY_SHAPES[priority](TONE_ACCESSORS[tone])),
		}))
	)

	const structural = (Object.keys(STRUCTURAL_VARIANTS) as (keyof typeof STRUCTURAL_VARIANTS)[]).map(variant => ({
		variant: variant as Variant,
		palette: combinePalettes(PRIORITY_SHAPES[STRUCTURAL_VARIANTS[variant]](
			TONE_ACCESSORS[variant === 'solid' ? 'action' : 'neutral']
		)),
	}))

	const special = (Object.keys(SPECIAL_VARIANTS) as (keyof typeof SPECIAL_VARIANTS)[]).map(variant => ({
		variant: variant as Variant,
		palette: combinePalettes(SPECIAL_VARIANTS[variant](TONE_ACCESSORS.action)),
	}))

	return [...semantic, ...structural, ...special]
}

