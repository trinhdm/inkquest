import type {
	SpecsContext, SpecsContract,
	SpecsTokens, SpecsTokenGroups,
} from '../factory/types'

import type { SiteThemeConfig } from '@/lib/theme/types'

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

type _ExactTokens<R, G> =
	R extends unknown
		? R & { [K in keyof R]: _CheckTokenGroup<R, G, K> }
		: never

type _TokensFn<
	P = unknown,
	V extends object = object,
	C = unknown,
> = ({ context, props, theme }: _DefineTokensProps<P, C>) => V

export type TokensParams<S extends SpecsContract> =
	_DefineTokensProps<S['props'], SpecsContext<S>>

export type TokensConfig<S extends SpecsContract> =
	_TokensFn<S['props'], SpecsTokens<S>, SpecsContext<S>>

export const defineTokens =
	<S extends SpecsContract>() =>
		<R extends object>(
			settings: (args: TokensParams<S>) => _ExactTokens<R, SpecsTokenGroups<S>>
		): TokensConfig<S> => settings as TokensConfig<S>
