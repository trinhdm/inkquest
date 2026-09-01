import type { CSSVariable, CSSVars } from '@/types/shared'
import type { SiteThemeConfig } from './types'
import type { SpecsList, ValidSpecs } from '@/types/spec'

type _ConvertCSSVars<V = CSSVars> = {
	[K in keyof V]: V[K] extends CSSVariable ? Record<V[K], string | undefined> : never
}

// export type ThemeCSSMap<TObj extends SpecsList<TObj>> = {
// 	[K in keyof TObj]: ThemeCSSConfig<TObj, K>
// }

export type ThemeCSSConfig<
	T extends ValidSpecs<T>,
	// K extends keyof T,
> = (
	theme: SiteThemeConfig,
	props: T['props'],
	ctx: T['ctx']
) => _ConvertCSSVars<T['tokens']>

export const setThemeCSS = <
	T extends ValidSpecs<T>,
	// K extends keyof T,
>(settings: ThemeCSSConfig<T>) => {
	return settings
}
