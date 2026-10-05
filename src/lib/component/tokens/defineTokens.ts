import type { CSSVariable } from '@/types/shared'
import type { SiteThemeConfig } from '@/lib/theme/types'
import type { SpecsContext, SpecsTokens, SpecsTokenGroups } from '../factory/types'

interface TokensArgs {
	context?: unknown
	props: object
	tokens?: Record<string, CSSVariable>
}

interface _DefineTokensProps<P = unknown, C = unknown> {
	context: C
	props: P
	theme: SiteThemeConfig
}

type _CheckTokenGroup<R, G, K extends keyof R> =
	K extends keyof G
		? G[K] & (
			[Exclude<keyof R[K], keyof G[K]>] extends [never]
				? unknown
				: { [E in Exclude<keyof R[K], keyof G[K]> & string as `undeclared token '${E}'`]: never }
		)
		: { [E in K & string as `undeclared selector '${E}'`]: never }

type ExactTokens<R, G> =
	R extends unknown
		? R & { [K in keyof R]: _CheckTokenGroup<R, G, K> }
		: never

type TokensFn<
	P = unknown,
	V extends object = object,
	C = unknown,
> = ({ context, props, theme }: _DefineTokensProps<P, C>) => V

type TokensParams<S extends TokensArgs> =
	_DefineTokensProps<S['props'], SpecsContext<S>>

export type TokensConfig<S extends TokensArgs> =
	TokensFn<S['props'], SpecsTokens<S>, SpecsContext<S>>

export const defineTokens =
	<S extends TokensArgs>() =>
		<R extends object>(
			settings: (args: TokensParams<S>) => ExactTokens<R, SpecsTokenGroups<S>>
		): TokensConfig<S> => settings as TokensConfig<S>
