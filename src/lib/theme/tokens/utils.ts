import { ALT_THEME, type ThemeConfig } from '../themeConfig'
import { alias, base } from '../reference'
import { colorMix, fromOklch, scaleLCH } from '../css'
import { isObject } from '@/utils/helpers'
import type { ColorScheme, StaticColorNames, TokenStateHues } from '../types'

const MIXMOD_DEFAULT_PERCENTS: ColorModArgs['percents'] = {
	tint: 20,
	shade: 30,
	bright: 50,
	dim: 80,
	muted: 85,
}

const getThemeMixer = () => ({
	dark: base.white(),
	light: base.black(),
})

const isStaticColor = (color: string): color is StaticColorNames =>
	Object.hasOwn(base, color)

interface ColorModArgs {
	alt: ColorScheme
	color: string
	percents?: Record<Extract<keyof TokenStateHues, 'bright' | 'dim' | 'muted' | 'shade' | 'tint'>, number>
	scheme: ColorScheme
}

const colorMod = ({ alt, color, percents, scheme }: ColorModArgs): TokenStateHues => {
	const target = isStaticColor(color) ? base[color]() : color,
		themeMixer = getThemeMixer()

	const lch = { l: -0.0325, c: 0.00575, h: -0.25 }

	const amount = percents ?? MIXMOD_DEFAULT_PERCENTS
	const mixer = {
		blend: alias.background.page(),
		shade: themeMixer[alt],
		tint: themeMixer[scheme],
		tone: base.gray(),
	}

	return {
		base: target,
		hover: fromOklch(target, lch),
		active: fromOklch(target, scaleLCH(lch, 2)),
		tint: colorMix(mixer.tint, amount.tint, target),
		shade: colorMix(mixer.shade, amount.shade, target),
		bright: colorMix(mixer.tint, amount.bright, target),
		dim: colorMix(mixer.shade, amount.dim, target),
		muted: colorMix(mixer.blend, amount.muted, target),
	}
}

const resolveScheme = <T>(config: ThemeConfig, values?: Record<ColorScheme, T>) => {
	const { name, scheme } = config,
		isDark = scheme === 'dark',
		alt = isDark ? 'light' : 'dark'

	const options = isObject(values) && Object.hasOwn(values, scheme)
		? values[scheme]
		: undefined

	const boundModColor = (
		color: ColorModArgs['color'],
		percents?: ColorModArgs['percents']
	) => colorMod({ alt, color, percents, scheme })

	const baseTheme = base[name],
		baseAlt = base[ALT_THEME[name]]

	return {
		colors: { alt: baseAlt, theme: baseTheme, get: options },
		isDark,
		modColor: boundModColor,
	}
}

type ResolvedColors<T> =
	ReturnType<typeof resolveScheme<T>>['colors']

type WithGetColors<T> =
	Omit<ReturnType<typeof resolveScheme<T>>, 'colors'>
	& { colors: Omit<ResolvedColors<T>, 'get'> & { get: T } }

export function byScheme<T>(config: ThemeConfig, values: Record<ColorScheme, T>): WithGetColors<T>
export function byScheme(config: ThemeConfig): ReturnType<typeof resolveScheme>
export function byScheme<T>(config: ThemeConfig, values?: Record<ColorScheme, T>) {
	return resolveScheme(config, values)
}
