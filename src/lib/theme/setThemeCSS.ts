import type { CSSVariable, CSSVars } from '@/types/shared'
import type { SiteTheme } from './types'
import type { SpecsList, ValidSpecs } from '@/types/spec'

type _ConvertCSSVars<V = CSSVars> = {
	[K in keyof V]: V[K] extends CSSVariable ? Record<V[K], string | undefined> : never
}

export type ThemeCSSConfig<S extends ValidSpecs<S>, T extends SpecsList<S> = SpecsList<S>> = (
	theme: SiteTheme,
	props: T['props'],
	ctx: T['ctx']
) => _ConvertCSSVars<T['tokens']>

export const setThemeCSS = <S extends ValidSpecs<S>>(settings: ThemeCSSConfig<S>) => {
	return settings
}
