import {
	createContext, use, useMemo,
	type ReactElement, type ReactNode,
} from 'react'

import type { NoExcessKeys } from '@/types/utils'

interface RootProviderProps<
	T,
	V extends T = T,
	N extends string = string,
> {
	children: ReactNode
	rootName?: N
	value: V & NoExcessKeys<T, V>
}

type BaseName<C extends string, N extends string> =
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
	| (T & { rootName: N })
	| null

export type RootProviderFn<T, N extends string = string> =
	<V extends T>(props: RootProviderProps<T, V, N>) => ReactElement

type InheritedProps<T, P, S extends keyof T> =
	[Exclude<S, keyof P>] extends [never]
		? P
		: P & Partial<Pick<T, Exclude<S, keyof P>>>

export const createCompoundCtx = <
	T extends object,
	N extends string = string,
>(name: N) => {
	const RootCtx = createContext<SafeRootCtxValue<T, N>>(null)

	const toBaseName = <C extends string>(component: C, root: N): BaseName<C, N> =>
		(component.startsWith(root) ? component.slice(root.length) : component)
			.replace(/^\./, '')
			.toLowerCase() as BaseName<C, N>

	const RootProvider = <V extends T>({ children, value }: RootProviderProps<T, V, N>) => {
		const ctxValue = useMemo(() => ({ ...value, rootName: name }), [value])
		return <RootCtx value={ ctxValue }>{ children }</RootCtx>
	}

	const useRootCtx = <C extends string>(component: C): RootCtxValue<T, N, C> => {
		const context = use(RootCtx)

		if (context === null)
			throw new Error(`${name}: <${component} /> must be rendered inside <${name}>`)

		return { ...context, baseName: toBaseName(component, name) } as RootCtxValue<T, N, C>
	}

	const useSafeRootCtx = (): SafeRootCtxValue<T, N> =>
		use(RootCtx)

	//	fills keys absent from `_props` with context values
	//	own prop always wins
	const inheritProps = <P extends object, K extends keyof T>(
		_props: P,
		context: SafeRootCtxValue<T, N>,
		selected?: K[],
	): P => {
		if (!context) return _props

		const shared = new Set<PropertyKey>(selected ?? []),
			inherited = {} as Partial<T>,
			uninherited: readonly PropertyKey[] = ['baseName', 'rootName']

		;(Object.keys(context) as (keyof T)[]).forEach(key => {
			const value = context[key]

			if (uninherited.includes(key)) return
			else if (value === undefined || Object.hasOwn(_props, key)) return
			else if (!!selected?.length && !shared.has(key)) return

			Object.assign(inherited, { [key]: value })
		})

		return { ...inherited, ..._props }
	}

	// reads the context AND applies the guarded merge in one call,
	// so a consumer just does `useProps(NAME, useRootProps(_props))`
	// with no way to get the precedence or the guard wrong
	const useRootProps = <P extends object, K extends keyof T>(
		_props: P,
		...selected: K[]
	): InheritedProps<T, P, K> =>
		inheritProps(_props, use(RootCtx), selected)

	return {
		RootProvider,
		useRootCtx,
		useSafeRootCtx,
		useRootProps,
	}
}
