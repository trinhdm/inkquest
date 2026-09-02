import { alias } from '../reference'
import { deepMerge } from '@/utils/helpers'
import type {
	Priority, Tone, Variant,
	VariantTokens,
} from '../types'

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
	emphasis: () => token('hover'),
	subtle: () => token('muted'),
	dim: () => token('dim'),
})

const DEFAULT_PALETTE: VariantTokens = {
	background: { base: 'transparent', hover: 'transparent' },
	border: { base: 'transparent', hover: 'transparent' },
	color: { base: 'inherit', hover: 'inherit' },
}

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

const mergePalette = (palette: Partial<VariantTokens>): VariantTokens =>
	deepMerge(DEFAULT_PALETTE, palette)

const resolveVariants = ({ variant, priority }: Omit<VariantPalette, 'palette'>) => {
	let tone: Tone = 'action'
	const isSpecial = variant in SPECIAL_VARIANTS,
		isStructural = variant in STRUCTURAL_VARIANTS

	if (isSpecial)
		return SPECIAL_VARIANTS[variant as keyof typeof SPECIAL_VARIANTS](TONE_ACCESSORS[tone])

	let role: Priority = priority ?? 'primary'
	tone = variant as Tone

	if (isStructural) {
		const target = (Object.keys(STRUCTURAL_VARIANTS) as (keyof typeof STRUCTURAL_VARIANTS)[])
			.find(key => STRUCTURAL_VARIANTS[key] === priority)

		role = STRUCTURAL_VARIANTS[target ?? variant as keyof typeof STRUCTURAL_VARIANTS]
		tone = role === 'primary' ? 'action' : 'neutral'
	}

	const result = PRIORITY_SHAPES[role](TONE_ACCESSORS[tone]),
		palette = mergePalette(result)

	return palette
}

const resolvePalette = ({ variant, priority }: Omit<VariantPalette, 'palette'>) => {
	const result = resolveVariants({ priority, variant }),
		palette = mergePalette(result)

	return palette
}

export interface VariantPalette {
	palette: Partial<VariantTokens>
	priority?: Priority
	variant: Variant
}

export const enumerateVariantPalettes = (): VariantPalette[] => {
	const priorities = ['primary', 'secondary', 'tertiary'] as const,
		semanticTones = ['danger', 'warning', 'success', 'info'] as const

	const special = (Object.keys(SPECIAL_VARIANTS) as (keyof typeof SPECIAL_VARIANTS)[]),
		structural = (Object.keys(STRUCTURAL_VARIANTS) as (keyof typeof STRUCTURAL_VARIANTS)[])

	const semantic = semanticTones.flatMap(tone =>
		priorities.map(priority => ({
			variant: tone as Variant,
			palette: resolvePalette({ priority, variant: tone as Variant }),
			priority,
		}))
	)

	const structured = structural.map(variant => ({
		variant: variant as Variant,
		palette: resolvePalette({ variant: variant as Variant }),
	}))

	const specialize = special.map(variant => ({
		variant: variant as Variant,
		palette: resolvePalette({ variant: variant as Variant }),
	}))

	return [...structured, ...specialize, ...semantic]
}
