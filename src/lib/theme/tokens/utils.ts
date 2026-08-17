import { ALT_THEME, type ThemeConfig } from '../themeConfig'
import { alias, base } from '../reference'
import { colorMix, fromOklch, scaleLCH } from '../css'
import { isObject } from '@/utils/helpers'
import type { ColorMixtures, ColorScheme, StaticColorNames } from '../types'

const getThemeMixer = () => ({
	dark: base.white(),
	light: base.black(),
})

const isStaticColor = (color: string): color is StaticColorNames =>
	Object.hasOwn(base, color)

interface ColorModArgs {
	alt: ColorScheme
	color: string
	scheme: ColorScheme
}

const colorMod = ({ alt, color, scheme }: ColorModArgs): ColorMixtures => {
	const target = isStaticColor(color) ? base[color]() : color,
		themeMixer = getThemeMixer()

	const lch = { l: -0.045, c: 0.005, h: -0.35 }

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
		tint: colorMix(mixer.tint, 30, target),
		shade: colorMix(mixer.shade, 30, target),
		bright: colorMix(mixer.tint, 80, target),
		dim: colorMix(mixer.shade, 80, target),
		muted: colorMix(mixer.blend, 85, target),
	}
}

const resolveScheme = <T>(config: ThemeConfig, values?: Record<ColorScheme, T>) => {
	const { name, scheme } = config,
		isDark = scheme === 'dark',
		alt = isDark ? 'light' : 'dark'

	const options = isObject(values) && Object.hasOwn(values, scheme)
		? values[scheme]
		: undefined

	const boundModColor = (color: string) => colorMod({ alt, color, scheme })
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
