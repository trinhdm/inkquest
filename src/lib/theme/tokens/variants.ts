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

export const VARIANT_ORDER: Record<
	Extract<Variant, 'solid' | 'outline' | 'ghost'>,
	Priority
> = {
	solid: 'primary',
	outline: 'secondary',
	ghost: 'tertiary',
}

const TONE_ACCESSORS: Record<Tone, ToneAccessor> = {
	neutral: {
		base: () => alias.color.text(),
		strong: () => alias.border('strong'),
		emphasis: () => alias.color.action(),
		subtle: () => alias.background.card(),
		dim: () => alias.border(),
	},
	action: fromMixture(alias.accent),
	danger: fromMixture(alias.color.danger),
	warning: fromMixture(alias.color.warning),
	success: fromMixture(alias.color.success),
	info: fromMixture(alias.color.info),
}

const PRIORITY_SHAPES: Record<
	Priority,
	(tone: ToneAccessor) => Partial<VariantTokens>
> = {
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

const SPECIAL_VARIANTS: Record<
	Extract<Variant, 'light' | 'dark' | 'text'>,
	(tone: ToneAccessor) => Partial<VariantTokens>
> = {
	light: tone => ({
		background:	tone.subtle(),
		border:		'currentColor',
		color: {
			base:	tone.base(),
			hover:	alias.color.text(),
		},
	}),
	dark: tone => ({
		background: tone.dim(),
		border:		tone.subtle(),
		color: {
			base:	tone.emphasis(),
			hover:	alias.color.text(),
		},
	}),
	text: () => ({
		background: 'transparent',
		border:		'transparent',
		color: {
			base:	alias.color.link(),
			hover:	alias.color.link('hover'),
		},
	}),
}

const mergePalette = (palette: Partial<VariantTokens>): VariantTokens =>
	deepMerge(DEFAULT_PALETTE, palette)

const resolveVariants = ({ priority, tone, variant }: Omit<VariantPalette, 'palette'>) => {
	let color: Tone = tone ?? 'action',
		role: Priority = priority ?? 'primary'

	const isOrdered = variant in VARIANT_ORDER,
		isSpecial = variant in SPECIAL_VARIANTS

	if (isSpecial) {
		const specialty = variant as keyof typeof SPECIAL_VARIANTS
		return SPECIAL_VARIANTS[specialty](TONE_ACCESSORS[color])
	}

	if (isOrdered) {
		const target = (Object.keys(VARIANT_ORDER) as (keyof typeof VARIANT_ORDER)[])
			.find(key => VARIANT_ORDER[key] === priority)

		role = VARIANT_ORDER[target ?? variant as keyof typeof VARIANT_ORDER]
		color = tone ?? (role === 'primary' ? 'action' : 'neutral')
	}

	return PRIORITY_SHAPES[role](TONE_ACCESSORS[color])
}

const resolvePalette = ({ priority, tone, variant }: Omit<VariantPalette, 'palette'>) => {
	const result = resolveVariants({ priority, tone, variant }),
		palette = mergePalette(result)

	return palette
}

export interface VariantPalette {
	palette: Partial<VariantTokens>
	priority?: Priority
	tone?: Tone
	variant: Variant
}

export const enumerateVariantPalettes = (): VariantPalette[] => {
	const priorities = Object.values(VARIANT_ORDER) satisfies Priority[],
		tones = Object.keys(TONE_ACCESSORS) as (keyof typeof TONE_ACCESSORS)[] satisfies Tone[]

	const foundation = Object.keys(VARIANT_ORDER) as (keyof typeof VARIANT_ORDER)[],
		specialty = Object.keys(SPECIAL_VARIANTS) as (keyof typeof SPECIAL_VARIANTS)[]

	const base = foundation.map(variant => ({
		variant,
		palette: resolvePalette({ variant }),
	}))

	const specialized = tones.flatMap(tone =>
		specialty
			.filter(variant => variant === 'text' ? tone === 'neutral' : tone !== 'neutral')
			.map(variant => ({
				tone,
				variant,
				palette: resolvePalette({ tone, variant }),
			}))
	)

	const ordered = tones.flatMap(tone =>
		priorities.map(priority => {
			const variant = foundation.
				find(key => VARIANT_ORDER[key] === priority) ?? 'solid'
			return {
				tone,
				variant,
				priority,
				palette: resolvePalette({ priority, tone, variant }),
			}
		})
	)

	return [...base, ...specialized, ...ordered]
}
