import type { CSSVariable, CSSVars } from '@/types/shared'
import type { SiteThemeConfig } from '@/lib/theme/types'

type _ConvertTokens<V = CSSVars> = {
	[K in keyof V]: V[K] extends CSSVariable
		? Record<V[K], string | undefined>
		: never
}

interface TokensArgs {
	ctx?: unknown
	props: object
	tokens?: unknown
}

export type TokensConfig<
	P = unknown,
	V extends object = object,
	C = unknown,
> = (props: P, theme: SiteThemeConfig, ctx: C) => V

export const defineTokens = <S extends TokensArgs>(
	settings: TokensConfig<S['props'], _ConvertTokens<S['tokens']>, S['ctx']>
) => settings
