/**
 * Type-level tests for `WithDefaults` — the helper that makes the props a
 * component has defaults for required on the resolved props type.
 *
 * Compile-time only, like `specs.test-d.ts`: Jest never picks this file up,
 * and `npm run test:types` is what runs it. Every `@ts-expect-error` is
 * paired with a positive control, for the reason given at the top of
 * `specs.test-d.ts`.
 */
import type { WithDefaults } from '../helpers.types'

/** Exact equality — defeats the usual bidirectional-assignability fudge. */
type Equal<A, B> =
	(<T>() => T extends A ? 1 : 2) extends (<T>() => T extends B ? 1 : 2)
		? true : false

type Expect<T extends true> = T

type Props = { label?: string; size?: 'sm' | 'lg'; variant?: string }


// ---- no defaults ------------------------------------------------------

// `never` keys leave the props untouched
type _NoKeys = Expect<Equal<WithDefaults<Props, never>, Props>>


// ---- required keys ----------------------------------------------------

// a defaulted key becomes required, and loses its `undefined`
type _SizeRequired = Expect<Equal<WithDefaults<Props, 'size'>['size'], 'sm' | 'lg'>>

// keys without a default stay optional
type _OthersOptional = Expect<
	Equal<Pick<WithDefaults<Props, 'size'>, 'label' | 'variant'>, { label?: string; variant?: string }>
>

// several keys at once
type _ManyKeys = Expect<Equal<
	Required<Pick<WithDefaults<Props, 'size' | 'variant'>, 'size' | 'variant'>>,
	{ size: 'sm' | 'lg'; variant: string }
>>

// a default key that isn't a prop is ignored rather than invented
type _UnknownKey = Expect<Equal<
	keyof WithDefaults<Props, 'size' | 'notAProp'>,
	keyof Props
>>


// ---- distribution -----------------------------------------------------

type Union = { kind: 'a'; a?: number } | { kind: 'b'; b?: number }

// each member of a union is handled on its own, so the discriminant survives
type _Distributes = Expect<Equal<
	WithDefaults<Union, 'kind'>['kind'],
	'a' | 'b'
>>

type _DistributesMembers = Expect<Equal<
	Extract<WithDefaults<Union, 'a' | 'b'>, { kind: 'a' }>['a'],
	number
>>


// ---- compile-time behaviour ------------------------------------------

declare const resolved: WithDefaults<Props, 'size'>

// positive control: supplying the defaulted key compiles
const _withSize: WithDefaults<Props, 'size'> = { size: 'sm' }

// positive control: the untouched props still allow omitting `size`
const _plainOmitsSize: Props = {}

// @ts-expect-error a defaulted key can no longer be omitted
const _missingSize: WithDefaults<Props, 'size'> = {}

// positive control for the read below
const _readSize: 'sm' | 'lg' = resolved.size


export type {
	_NoKeys,
	_SizeRequired,
	_OthersOptional,
	_ManyKeys,
	_UnknownKey,
	_Distributes,
	_DistributesMembers,
}
export { _withSize, _plainOmitsSize, _missingSize, _readSize }

// must-fail control: the Equal/Expect harness really rejects a wrong answer
// @ts-expect-error `size` is required after WithDefaults, so it can't equal the optional original
type _HarnessControl = Expect<Equal<WithDefaults<Props, 'size'>, Props>>
export type { _HarnessControl }
