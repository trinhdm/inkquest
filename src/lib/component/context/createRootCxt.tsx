import {
	createContext, use, useMemo,
	type ReactElement, type ReactNode,
} from 'react'
import type { NoExcessKeys } from '@/types/utils'

export interface RootCxtProviderProps<T, V extends T = T> {
    children: ReactNode
    rootName?: string
    unstyled?: boolean
    value: V & NoExcessKeys<T, V>
}

export type RootCxtProviderFn<T> =
	<V extends T>(props: RootCxtProviderProps<T, V>) => ReactElement

export const createRootCxt = <T extends object>(name: string) => {
	type RootCxtValue = T & { rootName: string }
	type RootCxtOptions = RootCxtValue | null

	const RootCxt = createContext<RootCxtOptions>(null)
	const uninherited: (keyof T)[] = ['rootName'] as (keyof T)[]

	const RootCxtProvider = <V extends T>({
		children,
		rootName,
		value,
	}: RootCxtProviderProps<T, V>) => {
		const cxtValue = useMemo(
			() => ({ ...value, rootName: rootName ?? name }),
			[rootName, value]
		)

		return <RootCxt value={ cxtValue }>{ children }</RootCxt>
	}

	const useRootCxt = (componentName: string): RootCxtValue => {
		const ctx = use(RootCxt)

		if (ctx === null)
			throw new Error(`<${componentName} /> must be rendered inside <${name}>`)

		return ctx
	}

	const useSafeRootCxt = (): RootCxtOptions =>
		use(RootCxt)

	/** Fills keys absent from `_props` with context values. Own prop always wins. */
	// refactor: NEW — and deliberately not exported. Previously this lived as
	// a public `inheritProps` util in `lib/component/index.ts` that every
	// consumer had to call correctly by hand. Keeping it private here means
	// there is no way for a consumer to skip the `Object.hasOwn` guard or
	// invert the precedence — `useRootProps` below is the only door in.
	const inheritProps = <P extends object>(
		_props: P,
		ctx: RootCxtOptions
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
		inheritProps(_props, use(RootCxt))

	return {
		RootCxtProvider,
		useRootCxt,
		useSafeRootCxt,
		useRootProps,
	}
}
