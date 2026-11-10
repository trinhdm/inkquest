/**
 * Type-level tests for the factory contract: the props a factory component
 * accepts, the `as` its render target sees, and the `.set()` / `.withProps()`
 * methods.
 *
 * Compile-time only, like `specs.test-d.ts`: Jest never picks this file up,
 * and `npm run test:types` is what runs it. A failed assertion is a type
 * error. Every `@ts-expect-error` is paired with a positive control, for the
 * reason given at the top of `specs.test-d.ts`, and kept on one line so the
 * error lands on the line the directive covers.
 */
import type { ComponentProps, CSSProperties, ElementType } from 'react'
import type { Specs } from '../specs.types'
import type {
	FactoryAsComponent,
	FactoryComponent,
	FactoryDisplayName,
	FactoryMethods,
	FactoryPropsList,
	FactorySubcomponents,
} from '../factory.types'

/** Exact equality — defeats the usual bidirectional-assignability fudge. */
type Equal<A, B> =
	(<T>() => T extends A ? 1 : 2) extends (<T>() => T extends B ? 1 : 2)
		? true : false

type Expect<T extends true> = T

/** Polymorphic, with two default prop keys — the shape most components use. */
type ButtonSpec = {
	defaults: { as: 'button'; props: 'size' | 'variant' }
	props: { onClick?: () => void; size?: 'sm' | 'lg'; variant?: string }
}

/** No `defaults` at all. */
type PlainSpec = {
	props: { onClick?: () => void }
}

/** A compound sub-component: never polymorphic. */
type CompoundSpec = {
	isCompound: true
	props: { onClick?: () => void }
}

/** Declares subcomponents, like `Section` or `Grid`. */
type ParentSpec = {
	props: { label?: string }
	subcomponents: { Item: () => null }
}

/** The argument `.set()` takes for a given spec. */
type SetArgs<S extends Specs> = Parameters<FactoryMethods<S>['set']>[0]

/** Stand-ins for the custom component/props types `polymorphic()` passes in. */
type MarkerComponent = { marker: 'component' }
type MarkerProps = { marker: 'props' }


// ---- FactoryPropsList -------------------------------------------------

// spec props + `as` + the shared contract under its NATIVE names
// (`className`/`style`, not `classNames`/`styles`) — and no `ref`
type _PropsKeys = Expect<Equal<
	keyof FactoryPropsList<PlainSpec>,
	'onClick' | 'as' | 'attributes' | 'children' | 'className' | 'id' | 'style' | 'unstyled'
>>

// the native names keep the shared contract's value types
type _PropsClassName = Expect<Equal<FactoryPropsList<PlainSpec>['className'], string | undefined>>
type _PropsStyle = Expect<Equal<FactoryPropsList<PlainSpec>['style'], CSSProperties | undefined>>

// a polymorphic spec takes only its own default tag here
type _PropsAsOpen = Expect<Equal<FactoryPropsList<ButtonSpec>['as'], 'button' | undefined>>

// a non-polymorphic spec takes no `as` at all
type _PropsAsClosed = Expect<Equal<FactoryPropsList<PlainSpec>['as'], undefined>>


// ---- FactoryComponent -------------------------------------------------

type _ComponentProps = Expect<Equal<
	ComponentProps<FactoryComponent<ButtonSpec>>,
	FactoryPropsList<ButtonSpec>
>>


// ---- FactoryAsComponent -----------------------------------------------

// the render target sees ANY element type, wider than the spec's own
// default tag — `createFactory` swaps this in for `FactoryPropsList`'s `as`
type _AsCompOpen = Expect<Equal<FactoryAsComponent<ButtonSpec>, { as?: ElementType }>>

type _AsCompPlain = Expect<Equal<FactoryAsComponent<PlainSpec>, { as?: never }>>
type _AsCompCompound = Expect<Equal<FactoryAsComponent<CompoundSpec>, { as?: never }>>


// ---- FactoryDisplayName -----------------------------------------------

type _DisplayName = Expect<Equal<FactoryDisplayName, { displayName?: string }>>


// ---- FactoryMethods: set() --------------------------------------------

// `set()` hands back exactly what it was given
type _SetReturnsArgs = Expect<Equal<
	ReturnType<FactoryMethods<ButtonSpec>['set']>,
	SetArgs<ButtonSpec>
>>

// a spec with default prop keys: every key AND the default tag are required,
// other props stay optional
const _buttonDefaults: SetArgs<ButtonSpec> = { defaultProps: { as: 'button', size: 'sm', variant: 'solid' } }
const _buttonExtraProp: SetArgs<ButtonSpec> = { defaultProps: { as: 'button', size: 'sm', variant: 'solid', onClick: () => undefined } }

// @ts-expect-error `defaultProps` is required when the spec names default props
const _buttonNoDefaults: SetArgs<ButtonSpec> = {}

// @ts-expect-error every named default prop must be given (`variant` is missing)
const _buttonMissingKey: SetArgs<ButtonSpec> = { defaultProps: { as: 'button', size: 'sm' } }

// @ts-expect-error the default tag must be given
const _buttonNoAs: SetArgs<ButtonSpec> = { defaultProps: { size: 'sm', variant: 'solid' } }

// @ts-expect-error the default tag must match the spec's `defaults.as`
const _buttonWrongAs: SetArgs<ButtonSpec> = { defaultProps: { as: 'div', size: 'sm', variant: 'solid' } }

// a spec without `defaults`: nothing is required, any prop may be defaulted
const _plainEmpty: SetArgs<PlainSpec> = {}
const _plainDefaults: SetArgs<PlainSpec> = { displayName: 'Plain', defaultProps: { onClick: () => undefined } }

// @ts-expect-error a non-polymorphic spec cannot register a default tag
const _plainDefaultAs: SetArgs<PlainSpec> = { defaultProps: { as: 'div' } }

// declared subcomponents must be passed
const _parentSubs: SetArgs<ParentSpec> = { subcomponents: { Item: () => null } }

// @ts-expect-error `subcomponents` is required when the spec declares them
const _parentNoSubs: SetArgs<ParentSpec> = {}

// @ts-expect-error a spec without subcomponents cannot be given any
const _plainSubs: SetArgs<PlainSpec> = { subcomponents: { Item: () => null } }


// ---- FactoryMethods: withProps() --------------------------------------

type _WithPropsTakes = Expect<Equal<
	Parameters<FactoryMethods<ButtonSpec>['withProps']>[0],
	FactoryPropsList<ButtonSpec>
>>

type _WithPropsReturns = Expect<Equal<
	ReturnType<FactoryMethods<ButtonSpec>['withProps']>,
	FactoryComponent<ButtonSpec>
>>

// `polymorphic()` overrides both the props and the component type
type _WithPropsOverrides = Expect<Equal<
	FactoryMethods<ButtonSpec, MarkerComponent, MarkerProps>['withProps'],
	(props: MarkerProps) => MarkerComponent
>>


// ---- FactorySubcomponents ---------------------------------------------

type _SubsDeclared = Expect<Equal<FactorySubcomponents<ParentSpec>, { Item: () => null }>>

// `unknown`, so it drops out of the component intersection (`X & unknown` is `X`)
type _SubsAbsent = Expect<Equal<FactorySubcomponents<PlainSpec>, unknown>>

export type {
	_PropsKeys,
	_PropsClassName,
	_PropsStyle,
	_PropsAsOpen,
	_PropsAsClosed,
	_ComponentProps,
	_AsCompOpen,
	_AsCompPlain,
	_AsCompCompound,
	_DisplayName,
	_SetReturnsArgs,
	_WithPropsTakes,
	_WithPropsReturns,
	_WithPropsOverrides,
	_SubsDeclared,
	_SubsAbsent,
}
export { _buttonDefaults, _buttonExtraProp, _buttonNoDefaults, _buttonMissingKey, _buttonNoAs, _buttonWrongAs }
export { _plainEmpty, _plainDefaults, _plainDefaultAs }
export { _parentSubs, _parentNoSubs, _plainSubs }
