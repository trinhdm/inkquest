import type { SiteThemeConfig } from '@/lib/theme/types'
import type { SpecsContext, SpecsTokens } from '../factory/types'

interface TokensArgs {
	context?: unknown
	props: object
	tokens?: unknown
}

interface DefineTokensProps<P = unknown, C = unknown> {
	context: C
	props: P
	theme: SiteThemeConfig
}

type TokensFn<
	P = unknown,
	V extends object = object,
	C = unknown,
> = ({ context, props, theme }: DefineTokensProps<P, C>) => V

export type TokensConfig<S extends TokensArgs> =
	TokensFn<S['props'], SpecsTokens<S>, SpecsContext<S>>

export const defineTokens =
	<S extends TokensArgs>(settings: TokensConfig<S>) => settings
