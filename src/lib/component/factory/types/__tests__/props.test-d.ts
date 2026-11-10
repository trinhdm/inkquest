/**
 * Type-level tests for `PropsDefaultList` — the keys a component may declare
 * defaults for (every key of its `DEFAULT_PROPS` except `as`).
 *
 * `IsPolymorphic` and `AsPolymorphic` are asserted in `specs.test-d.ts`, so
 * they are not repeated here. Compile-time only; `npm run test:types` runs it.
 * Every `@ts-expect-error` is paired with a positive control.
 */
import type { PropsDefaultList } from '../props.types'

/** Exact equality — defeats the usual bidirectional-assignability fudge. */
type Equal<A, B> =
	(<T>() => T extends A ? 1 : 2) extends (<T>() => T extends B ? 1 : 2)
		? true : false

type Expect<T extends true> = T

/** Mirrors `typeof DEFAULT_PROPS` as the form components pass it. */
type Defaults = { as: 'input'; size: 'md'; variant: 'solid' }


// ---- plain default objects -------------------------------------------

// `as` is the tag, never a defaultable prop
type _DropsAs = Expect<Equal<PropsDefaultList<Defaults>, 'size' | 'variant'>>

// without an `as` there is nothing to drop
type _NoAs = Expect<Equal<PropsDefaultList<{ size: 'md'; variant: 'solid' }>, 'size' | 'variant'>>

// only `as`: nothing is left to default
type _OnlyAs = Expect<Equal<PropsDefaultList<{ as: 'div' }>, never>>

// an empty object has no keys
type _Empty = Expect<Equal<PropsDefaultList<object>, never>>


// ---- compile-time behaviour ------------------------------------------

// positive control: a real key is accepted
const _acceptsSize: PropsDefaultList<Defaults> = 'size'

// @ts-expect-error `as` can't be declared as a default prop
const _rejectsAs: PropsDefaultList<Defaults> = 'as'

// @ts-expect-error a key the defaults object lacks is rejected
const _rejectsUnknown: PropsDefaultList<Defaults> = 'color'

export type { _DropsAs, _NoAs, _OnlyAs, _Empty }
export { _acceptsSize, _rejectsAs, _rejectsUnknown }

// must-fail control: the Equal/Expect harness really rejects a wrong answer
// @ts-expect-error `as` is excluded, so the list can't include it
type _HarnessControl = Expect<Equal<PropsDefaultList<Defaults>, 'as' | 'size' | 'variant'>>
export type { _HarnessControl }
