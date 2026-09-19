import {
	createContext, use, useMemo,
	type ReactElement, type ReactNode,
} from 'react'
import type { NoExcessKeys } from '@/types/utils'

export interface RootProviderProps<T, V extends T = T> {
    children: ReactNode
    rootName?: string
    unstyled?: boolean
    value: V & NoExcessKeys<T, V>
}

export type RootProviderFn<T> =
	<V extends T>(props: RootProviderProps<T, V>) => ReactElement

export const createRootCtx = <T extends object>(name: string) => {
	type RootCtxValue = T & { rootName: string }
	type RootCtxOptions = RootCtxValue | null

	const RootCtx = createContext<RootCtxOptions>(null)
	const uninherited: (keyof T)[] = ['rootName'] as (keyof T)[]

	const RootProvider = <V extends T>({
		children,
		rootName,
		value,
	}: RootProviderProps<T, V>) => {
		const ctxValue = useMemo(
			() => ({ ...value, rootName: rootName ?? name }),
			[rootName, value]
		)

		return <RootCtx value={ ctxValue }>{ children }</RootCtx>
	}

	const useRootCtx = (componentName: string): RootCtxValue => {
		const ctx = use(RootCtx)

		if (ctx === null)
			throw new Error(`<${componentName} /> must be rendered inside <${name}>`)

		return ctx
	}

	const useSafeRootCtx = (): RootCtxOptions =>
		use(RootCtx)

	/** Fills keys absent from `_props` with context values. Own prop always wins. */
	// refactor: NEW — and deliberately not exported. Previously this lived as
	// a public `inheritProps` util in `lib/component/index.ts` that every
	// consumer had to call correctly by hand. Keeping it private here means
	// there is no way for a consumer to skip the `Object.hasOwn` guard or
	// invert the precedence — `useRootProps` below is the only door in.
	const inheritProps = <P extends object>(
		_props: P,
		ctx: RootCtxOptions
	): P => {
		if (!ctx) return _props
		const inherited = {} as Partial<T>

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

	// refactor: NEW — the third hook. Reads the context AND applies the
	// guarded merge in one call, so a consumer just does
	// `useProps(NAME, useRootProps(_props))` with no way to get the
	// precedence or the guard wrong
	const useRootProps = <P extends object>(_props: P): P =>
		inheritProps(_props, use(RootCtx))

	return {
		RootProvider,
		useRootCtx,
		useSafeRootCtx,
		useRootProps,
	}
}
