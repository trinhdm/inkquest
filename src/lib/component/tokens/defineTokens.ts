import type { CSSVariable, CSSVars } from '@/types/shared'
import type { SiteThemeConfig } from '@/lib/theme/types'

export type TokensList<V = CSSVars> = {
	[K in keyof V]: V[K] extends CSSVariable
		? Record<V[K], number | string | undefined>
		: never
} | Record<PropertyKey, never>

interface TokensArgs {
	context?: unknown
	props: object
	tokens?: unknown
}

export type TokensConfig<
	P = unknown,
	V extends object = object,
	C = unknown,
> = (props: P, theme: SiteThemeConfig, context: C) => V

export const defineTokens = <S extends TokensArgs>(
	settings: TokensConfig<S['props'], TokensList<S['tokens']>, S['context']>
) => settings
