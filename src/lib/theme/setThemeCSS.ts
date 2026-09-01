import type { CSSVariable, CSSVars } from '@/types/shared'
import type { SiteThemeConfig } from './types'

type _ConvertCSSVars<V = CSSVars> = {
	[K in keyof V]: V[K] extends CSSVariable
		? Record<V[K], string | undefined>
		: never
}

interface ThemeSpec {
	ctx?: unknown
	props: object
	tokens?: unknown
}

export type ThemeCSSConfig<
	P = unknown,
	V extends object = object,
	C = unknown,
> = (theme: SiteThemeConfig, props: P, ctx: C) => V

export const setThemeCSS = <S extends ThemeSpec>(
	settings: ThemeCSSConfig<S['props'], _ConvertCSSVars<S['tokens']>, S['ctx']>
) => settings


// export type ThemeCSSMap<TObj extends SpecsList<TObj>> = {
// 	[K in keyof TObj]: ThemeCSSConfig<TObj, K>
// }

// export type ThemeCSSConfig<
// 	T extends ValidSpecs<T>,
// 	// K extends keyof T,
// > = (
// 	theme: SiteThemeConfig,
// 	props: T['props'],
// 	ctx: T['ctx']
// ) => _ConvertCSSVars<T['tokens']>

// export const setThemeCSS = <
// 	T extends ValidSpecs<T>,
// 	// K extends keyof T,
// >(settings: ThemeCSSConfig<T>) => {
// 	return settings
// }
