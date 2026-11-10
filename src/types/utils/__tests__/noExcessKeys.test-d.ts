/**
 * Type-level tests for `NoExcessKeys`, the check behind `RootProvider`,
 * `withProvider` and `createPageCtx`: every key of a provided value must exist
 * in the context type, including keys of nested plain objects.
 *
 * Compile-time only: Jest never picks this file up, and `npm run test:types`
 * is what runs it. Every `@ts-expect-error` is paired with a positive control.
 * Values go through variables first, as in the components (`useMemo` results),
 * so TypeScript's own fresh-literal check can't be what catches them.
 */
import type { ReactElement, ReactNode } from 'react'
import type { NoExcessKeys } from '../helpers'

// mirrors `RootProvider`'s `value` param: V is inferred, then checked against T
declare const provide: <T>() => <V extends T>(value: V & NoExcessKeys<T, V>) => void

interface Ctx {
	idx: { control: string; error: string }
	icon?: ReactNode
	nested?: { a: string }
	onSelect: (index: number) => void
	items: { id: string }[]
	dynamic: Record<string, boolean> & { error: boolean }
	exact: Record<'button', boolean> & { error: boolean }
}

const check = provide<Ctx>()

const base = {
	dynamic: { error: true },
	exact: { button: false, error: true },
	idx: { control: 'c', error: 'e' },
	items: [],
	onSelect: (_: number) => {},
}


// ---- top level ----------------------------------------------------------

const exactValue = { ...base }
check(exactValue)

const topLevelExtra = { ...base, extra: 1 }
// @ts-expect-error - `extra` isn't a key of Ctx
check(topLevelExtra)


// ---- nested plain objects -----------------------------------------------

const nestedExact = { ...base, nested: { a: 'x' } }
check(nestedExact)

const nestedExtra = { ...base, idx: { control: 'c', error: 'e', info: 'i' } }
// @ts-expect-error - `idx.info` isn't a key of Ctx['idx']
check(nestedExtra)

const optionalNestedExtra = { ...base, nested: { a: 'x', b: 'y' } }
// @ts-expect-error - `nested.b` isn't a key of Ctx['nested']
check(optionalNestedExtra)


// ---- values that aren't key-checked -------------------------------------

// a `ReactNode` slot holding an element isn't descended into
const withElement = { ...base, icon: null as unknown as ReactElement }
check(withElement)

// array items aren't checked (a known limit)
const arrayItemExtra = { ...base, items: [{ id: 'a', extra: 1 }] }
check(arrayItemExtra)


// ---- dynamic vs exact keys ----------------------------------------------

// an index signature in the context type allows any key
const dynamicKey = { ...base, dynamic: { button: true, error: true } }
check(dynamicKey)

// a computed key widens to `[x: string]`, which an exact type rejects,
// so a key like `selector.button` has to be written out by name
declare const layout: string
const computedKey = { ...base, exact: { [`${layout}`]: true, error: true } }
// @ts-expect-error - `[x: string]` isn't a key of Ctx['exact']
check(computedKey)
