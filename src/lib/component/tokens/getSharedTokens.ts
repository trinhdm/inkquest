import { defineTokens, type TokensConfig, type TokensParams } from './defineTokens'
import type { SpecsContract, SpecsTokenGroups } from '../factory/types'

export const getSharedTokens = <
	S extends Record<string, SpecsContract>,
	N extends keyof S = 'root'
>(
	callback: (args: TokensParams<S[N]>, name?: N) => SpecsTokenGroups<S[N]>,
	name: N = 'root' as N,
): TokensConfig<S[N]> =>
	defineTokens<S[N]>()(args => {
		if (name === 'root' && !!args.context) return {}
		return callback(args, name)
	})

// function getSharedTokens<S extends SpecsContract>(
// 	callback: (args: TokensParams<S>) => SpecsTokenGroups<S>
// ): TokensConfig<S>
// function getSharedTokens<
// 	S extends Record<string, SpecsContract>,
// 	N extends keyof S = 'root'
// >(
// 	callback: (args: TokensParams<S[N]>, name?: N) => SpecsTokenGroups<S[N]>,
// 	name: N,
// ): TokensConfig<S[N]>
// function getSharedTokens<
// 	S extends Record<string, SpecsContract>,
// 	N extends string = 'root'
// >(
// 	callback: (args: TokensParams<S[N]>, name?: string) => SpecsTokenGroups<S[N]>,
// 	name: string = 'root',
// ): TokensConfig<S[N]> {
// 	return defineTokens<S[N]>()(args => {
// 		if (name !== 'group' && !args.context) return {}
// 		return callback(args, name)
// 	})
// }
// export const defineSharedTokens = getSharedTokens
