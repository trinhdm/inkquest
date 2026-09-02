import { createContext, use, type ReactNode } from 'react'

interface RootCxtProviderProps<T> {
	children: ReactNode
	value: T
}

export const createRootCxt = <T,>(name: string) => {
	const RootCxt = createContext<T | null>(null)

	const RootCxtProvider = ({ children, value }: RootCxtProviderProps<T>) => (
		<RootCxt value={ value }>{ children }</RootCxt>
	)

	const useRootCxt = (componentName: string): T => {
		const ctx = use(RootCxt)

		if (ctx === null)
			throw new Error(`<${componentName} /> must be rendered inside <${name}>`)

		return ctx
	}

	const useSafeRootCxt = () => use(RootCxt)

	/** Fills keys absent from `_props` with context values. Own prop always wins. */
	// refactor: NEW — and deliberately not exported. Previously this lived as
	// a public `inheritProps` util in `lib/component/index.ts` that every
	// consumer had to call correctly by hand. Keeping it private here means
	// there is no way for a consumer to skip the `Object.hasOwn` guard or
	// invert the precedence — `useRootProps` below is the only door in.
	const inheritProps = <P extends object>(_props: P, cxt: T | null): P => {
		if (!cxt) return _props
		const inherited = {} as Partial<T>

		// `Object.hasOwn` on the RAW `_props` — not a `useProps`-merged result —
		// is what keeps "unset" and "explicitly set to the registry default"
		// distinguishable. `filterProps` (utils/helpers/props.ts) treats any
		// *present* key as valid, `undefined` value included, so a naive
		// `{ ...cxt, ..._props }` spread would let an explicit `size={undefined}`
		// silently clobber a registry default like `Icon`'s `size: 24`.
		(Object.keys(cxt) as (keyof T)[]).forEach(key => {
			if (cxt[key] !== undefined && !Object.hasOwn(_props, key as string))
				Object.assign(inherited, { [key]: cxt[key] })
		})

		return { ...inherited, ..._props }
	}

	// refactor: NEW — the third hook. Reads the context AND applies the
	// guarded merge in one call, so a consumer just does
	// `useProps(NAME, useRootProps(_props))` with no way to get the
	// precedence or the guard wrong
	const useRootProps = <P extends object>(_props: P): P =>
		inheritProps(_props, use(RootCxt))

	return { RootCxtProvider, useRootCxt, useSafeRootCxt, useRootProps }
}
