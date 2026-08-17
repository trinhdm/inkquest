import { ALT_THEME, type ThemeConfig } from '../themeConfig'
import { alias, base } from '../reference'
import { colorMix, fromOklch } from '../css'
import { isObject } from '@/utils/helpers'
import type { ColorMixtures, ColorScheme, StaticColorNames } from '../types'

const getThemeMixer = () => ({
	dark: base.white(),
	light: base.black(),
})

const isStaticColor = (color: string): color is StaticColorNames =>
	Object.hasOwn(base, color)

export const colorMod = (color: StaticColorNames | string): ColorMixtures => {
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
		active: fromOklch(target, { l: 2 * lch.l, c: 2 * lch.c, h: 2 * lch.h }),
		tint: colorMix(mixer.tint, 30, target),
		shade: colorMix(mixer.shade, 30, target),
		bright: colorMix(mixer.tint, 80, target),
		dim: colorMix(mixer.shade, 80, target),
		muted: colorMix(mixer.blend, 85, target),
	}
}

const resolveScheme = <T>(config: ThemeConfig, values?: Record<ColorScheme, T>) => {
	const { name, scheme } = config,
		isDark = scheme === 'dark'

	const options = isObject(values) && Object.hasOwn(values, scheme)
		? values[scheme]
		: undefined
	const baseTheme = base[name],
		baseAlt = base[ALT_THEME[name]]

	return {
		colors: { alt: baseAlt, theme: baseTheme, get: options },
		isDark,
	}
}

type ResolvedColors<T> =
	ReturnType<typeof resolveScheme<T>>['colors']

type WithGetColors<T> =
	Omit<ReturnType<typeof resolveScheme<T>>, 'colors'>
	& { colors: Omit<ResolvedColors<T>, 'get'> & { get: T } }

export function byTheme<T>(config: ThemeConfig, values: Record<ColorScheme, T>): WithGetColors<T>
export function byTheme(config: ThemeConfig): ReturnType<typeof resolveScheme>
export function byTheme<T>(config: ThemeConfig, values?: Record<ColorScheme, T>) {
	return resolveScheme(config, values)
}
