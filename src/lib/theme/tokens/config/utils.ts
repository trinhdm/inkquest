import { ALT_THEME, type ThemeConfig } from './theme'
import { alias, base } from '../reference'
import { isObject } from '@/utils/helpers'
import type { ColorMixtures } from './types'
import type { StaticColorNames } from '../reference/primitive'
import type { ThemeName } from '../../types'

export const colorMix = (mixColor: string, percent: number, withColor: string): string =>
	`color-mix(in oklab, ${mixColor} ${percent}%, ${withColor})`


type LCHValues<T extends 'l' | 'c' | 'h'> =
	| `${number}${T extends 'h' ? 'deg' : '%'}`
	| `${T}`
	| number
	| 'none'

type AsLCH<T extends 'l' | 'c' | 'h'> =
	T extends 'l' ? LCHValues<'l'>
		: T extends 'c' ? LCHValues<'c'>
			: T extends 'h' ? LCHValues<'h'>
				: never

type ToOKLCHValue =
	`${AsLCH<'l'>} ${AsLCH<'c'>} ${AsLCH<'h'>}`

type ToOKLCHString =
	| `oklch(${ToOKLCHValue})`
	| `oklch(${ToOKLCHValue} / ${number})`
	| `oklch(${number} / ${ToOKLCHValue})`

export interface ToOKLCHArgs {
	l?: AsLCH<'l'>
	c?: AsLCH<'c'>
	h?: AsLCH<'h'>
	alpha?: number
}

export const toOklch = (
	{ l = 'l', c = 'c', h = 'h', alpha }: ToOKLCHArgs
): ToOKLCHString => {
	const alphaPart = alpha !== undefined ? ` / ${alpha}` as const : ''
	return `oklch(${l} ${c} ${h}${alphaPart})`
}


type LCHCalc<T extends 'l' | 'c' | 'h'> =
	| `calc(${T} + ${number})`

type AsCalcLCH<T extends 'l' | 'c' | 'h'> =
	T extends 'l' ? LCHCalc<'l'>
		: T extends 'c' ? LCHCalc<'c'>
			: T extends 'h' ? LCHCalc<'h'>
				: never

type FromOKLCHValue =
	`${AsCalcLCH<'l'>} ${AsCalcLCH<'c'>} ${AsCalcLCH<'h'>}`

export type FromOKLCHString =
	| `oklch(from ${string} ${FromOKLCHValue})`
	| `oklch(from ${string} ${FromOKLCHValue} / ${number})`
	| `oklch(from ${string} ${number} / ${FromOKLCHValue})`

export interface FromOKLCHArgs {
	l?: number
	c?: number
	h?: number
	alpha?: number
}

export const fromOklch = (
	color: string,
	{ l = 0, c = 0, h = 0, alpha }: FromOKLCHArgs
): FromOKLCHString => {
	const alphaPart = alpha !== undefined ? ` / ${alpha}` as const : ''
	return `oklch(from ${color} calc(l + ${l}) calc(c + ${c}) calc(h + ${h})${alphaPart})`
}


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

	const lch = {
		l: -0.045,
		c: 0.005,
		h: -0.35,
	}

	return {
		base: target,
		hover: fromOklch(target, lch),
		active: fromOklch(target, { l: 2 * lch.l, c: 2 * lch.c, h: 2 * lch.h }),
		tint: colorMix(mixer.tint, 30, target),
		shade: colorMix(mixer.shade, 30, target),
		bright: colorMix(mixer.tint, 80, target),
		dim: colorMix(mixer.shade, 80, target),
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
