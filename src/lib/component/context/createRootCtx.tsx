import {
	createContext, use, useMemo,
	type ReactElement, type ReactNode,
} from 'react'
import type { NoExcessKeys } from './props.types'

export interface RootProviderProps<
	T,
	V extends T = T,
	N extends string = string,
> {
	children: ReactNode
	rootName?: N
	unstyled?: boolean
	value: V & NoExcessKeys<T, V>
}

export type BaseName<C extends string, N extends string> =
	C extends N
		? Lowercase<N>
		: C extends `${N}.${infer Rest}`
			? Lowercase<Rest>
			: C extends `${N}${infer Rest}`
				? Lowercase<Rest>
				: Lowercase<C>

export type RootCtxValue<T, N extends string = string, C extends string = N> =
	T & {
		baseName: BaseName<C, N>
		rootName: N
	}

export type SafeRootCtxValue<T, N extends string = string> =
	| (T & Required<Pick<RootProviderProps<T, T, N>, 'rootName'>>)
	| null

export type RootProviderFn<T, N extends string = string> =
	<V extends T>(props: RootProviderProps<T, V, N>) => ReactElement

export const createRootCtx = <
	T extends object,
	N extends string = string,
>(name: N) => {
	const RootCtx = createContext<SafeRootCtxValue<T, N>>(null)

	const RootProvider = <V extends T>({
		children,
		rootName,
		value,
	}: RootProviderProps<T, V, N>) => {
		const ctxValue = useMemo(
			() => ({ ...value, rootName: rootName ?? name }),
			[rootName, value]
		)

		return <RootCtx value={ ctxValue }>{ children }</RootCtx>
	}

	const useRootCtx = <C extends string>(componentName: C): RootCtxValue<T, N, C> => {
		const ctx = use(RootCtx)

		if (ctx === null)
			throw new Error(`<${componentName} /> must be rendered inside <${name}>`)

		const { rootName } = ctx
		let baseName: string = rootName

		if ((rootName as string) !== componentName) {
			const compoundName = componentName.replace(rootName, ''),
				index = compoundName.startsWith('.') ? 1 : 0
			baseName = compoundName.slice(index)
		}

		baseName = baseName.toLowerCase()

		return { ...ctx, baseName } as RootCtxValue<T, N, C>
	}

	const useSafeRootCtx = (): SafeRootCtxValue<T, N> =>
		use(RootCtx)

	/** Fills keys absent from `_props` with context values. Own prop always wins. */
	// refactor: NEW — and deliberately not exported. Previously this lived as
	// a public `inheritProps` util in `lib/component/index.ts` that every
	// consumer had to call correctly by hand. Keeping it private here means
	// there is no way for a consumer to skip the `Object.hasOwn` guard or
	// invert the precedence — `useRootProps` below is the only door in.
	const inheritProps = <P extends object>(
		_props: P,
		ctx: SafeRootCtxValue<T, N>,
	): P => {
		if (!ctx) return _props

		const inherited = {} as Partial<T>,
			uninherited = ['rootName'] as (keyof T)[]

		// `Object.hasOwn` on the RAW `_props` — not a `useProps`-merged result —
		// is what keeps "unset" and "explicitly set to the registry default" distinguishable.
		// `filterProps` (hooks/useProps/helpers.ts) treats any *present* key as valid,
		// `undefined` value included, so a naive `{ ...ctx, ..._props }` spread
		// would let an explicit `size={undefined}` silently clobber a registry default
		// like `Icon`'s `size: 24`.
		;(Object.keys(ctx) as (keyof T)[]).forEach(key => {
			const propsHasKey = ctx[key] !== undefined && !Object.hasOwn(_props, key as string)
			if (!uninherited.includes(key) && propsHasKey)
				Object.assign(inherited, { [key]: ctx[key] })
		})

		return { ...inherited, ..._props }
	}

	// reads the context AND applies the guarded merge in one call,
	// so a consumer just does `useProps(NAME, useRootProps(_props))`
	// with no way to get the precedence or the guard wrong
	const useRootProps = <P extends object>(_props: P): P =>
		inheritProps(_props, use(RootCtx))

	return {
		RootProvider,
		useRootCtx,
		useSafeRootCtx,
		useRootProps,
	}
}
