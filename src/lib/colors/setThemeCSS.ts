import type { SiteTheme } from '@/providers/ThemeProvider'
import type { CSSVariable, CSSVars } from '@/types/common'
import type { ValidSpecs } from '@/types/spec'

// type _ConvertCSSVars<V> = V extends CSSVariable ? V : never
type _ConvertCSSVars<V = CSSVars> = {
	[K in keyof V]: V[K] extends CSSVariable ? Record<V[K], string | undefined> : never
}

export type ThemeCSSConfig<S extends ValidSpecs<S>> = (
	theme: SiteTheme,
	props: S['props'],
	ctx: S['ctx']
) => _ConvertCSSVars<S['cssVars']>

export const setThemeCSS = <S extends ValidSpecs<S>>(settings: ThemeCSSConfig<S>) => {
	return settings
}
