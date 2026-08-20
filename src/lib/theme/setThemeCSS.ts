import type { CSSVariable, CSSVars } from '@/types/shared'
import type { SiteTheme } from './types'
import type { ValidSpecs } from '@/types/spec'

type _ConvertCSSVars<V = CSSVars> = {
	[K in keyof V]: V[K] extends CSSVariable ? Record<V[K], string | undefined> : never
}

export type ThemeCSSConfig<S extends ValidSpecs<S>> = (
	theme: SiteTheme,
	props: S['props'],
	ctx: S['ctx']
) => _ConvertCSSVars<S['tokens']>

export const setThemeCSS = <S extends ValidSpecs<S>>(settings: ThemeCSSConfig<S>) => {
	return settings
}
