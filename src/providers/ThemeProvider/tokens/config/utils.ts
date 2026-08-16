import { ALT_THEME, type ThemeConfig } from './theme'
import { alias, base } from '../reference'
import { isObject } from '@/utils/helpers'
import type { ColorMixtures } from './types'
import type { StaticColorNames } from '../reference/primitive'
import type { ThemeName } from '../../theme.types'

export const colorMix = (mixColor: string, percent: number, withColor: string): string =>
	`color-mix(in oklab, ${mixColor} ${percent}%, ${withColor})`

const getThemeMixer = () => ({
	dark: base.white(),
	light: base.black(),
})

const isStaticColor = (color: string): color is StaticColorNames =>
	Object.hasOwn(base, color)

export const colorMod = (color: StaticColorNames | string): ColorMixtures => {
	const target = isStaticColor(color) ? base[color]() : color,
		themeMixer = getThemeMixer()

	const mixer = {
		blend: alias.background.page(),
		shade: themeMixer['light'],
		tint: themeMixer['dark'],
		tone: base.gray(),
	}

	return {
		base: target,
		tint: colorMix(mixer.tint, 10, target),
		shade: colorMix(mixer.shade, 10, target),
		dusty: colorMix(mixer.tone, 60, target),
		dim: colorMix(mixer.shade, 80, target),
		bright: colorMix(mixer.tint, 80, target),
		muted: colorMix(mixer.blend, 80, target),
	}
}

const resolveTheme = <T>(config: ThemeConfig, values?: Record<ThemeName, T>) => {
	const { name, scheme } = config,
		themeMixer = getThemeMixer(),
		mixer = themeMixer[name]

	const options = isObject(values) && Object.hasOwn(values, name)
		? values[name]
		: undefined

	const baseTheme = base[scheme],
		baseAlt = base[ALT_THEME[scheme]],
		colors = { alt: baseAlt, theme: baseTheme, get: options }

	const isDark = name === 'dark',
		isLight = name === 'light'

	return { colors, isDark, isLight, mixer }
}

type ResolvedColors<T> =
	ReturnType<typeof resolveTheme<T>>['colors']

type WithGetColors<T> =
	Omit<ReturnType<typeof resolveTheme<T>>, 'colors'>
	& { colors: Omit<ResolvedColors<T>, 'get'> & { get: T } }

export function byTheme<T>(config: ThemeConfig, values: Record<ThemeName, T>): WithGetColors<T>
export function byTheme(config: ThemeConfig): ReturnType<typeof resolveTheme>
export function byTheme<T>(config: ThemeConfig, values?: Record<ThemeName, T>) {
	return resolveTheme(config, values)
}
