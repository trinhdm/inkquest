import type { SiteThemeConfig } from '@/lib/theme/types'
import type { SpecsContext, SpecsTokens } from '../factory'

interface TokensArgs {
	context?: unknown
	props: object
	tokens?: unknown
}

type TokensFn<
	P = unknown,
	V extends object = object,
	C = unknown,
> = (props: P, theme: SiteThemeConfig, context: C) => V

export type TokensConfig<S extends TokensArgs> =
	TokensFn<S['props'], SpecsTokens<S>, SpecsContext<S>>

export const defineTokens = <S extends TokensArgs>(
	settings: TokensConfig<S>
) => settings
