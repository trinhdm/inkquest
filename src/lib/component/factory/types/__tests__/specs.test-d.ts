/**
 * Type-level tests for the Polymorphic specs contract.
 *
 * These assert at compile time only — there is no runtime body, and Jest
 * never picks the file up (`jest.config.ts` sets an explicit `testMatch`
 * that requires `.test.` in the filename, so `*.test-d.ts` matches neither
 * pattern). `npm run test:types` is what executes them: a failed
 * assertion is a type error, so the script exits non-zero.
 *
 * Two ways to assert:
 *   - `Expect<Equal<A, B>>` for exact type equality.
 *   - `@ts-expect-error` for "this must NOT compile" — but note that it
 *     swallows *any* error on the next line, including a typo or a missing
 *     import, which silently turns the assertion into a no-op. Every use
 *     below is paired with a positive control that would break if the
 *     symbol under test disappeared.
 */
import type {
	Specs,
	SpecsDefaultAs,
	SpecsDefaultProps,
	SpecsTokenGroups,
	SpecsTokens,
	TokensNever,
	TokenValue,
} from '../specs.types'

import type { AsPolymorphic, IsPolymorphic } from '../props.types'

/** Exact equality — defeats the usual bidirectional-assignability fudge. */
type Equal<A, B> =
	(<T>() => T extends A ? 1 : 2) extends (<T>() => T extends B ? 1 : 2)
		? true : false

type Expect<T extends true> = T

/**
 * `defaults` is REQUIRED here, matching how real components declare their
 * specs (e.g. `BadgeSpecs`). Declaring it optional makes every conditional
 * below fall to its fallback branch — which is exactly how the previous
 * version of this file passed while asserting nothing.
 */
type ButtonSpec = {
	defaults: { as: 'button'; props: 'size' | 'variant' }
	props: { onClick?: () => void; size?: 'sm' | 'lg'; variant?: string }
}

/** No `defaults` at all — a compound sub-component's shape. */
type PlainSpec = {
	props: { onClick?: () => void }
}


// ---- SpecsDefaultAs ---------------------------------------------------

// resolves to the literal tag, not the widened `string` or `ElementType`
type _AsResolves = Expect<Equal<SpecsDefaultAs<ButtonSpec>, 'button'>>

// falls back to `never` when the spec declares no `defaults`
type _AsFallsBack = Expect<Equal<SpecsDefaultAs<PlainSpec>, never>>

// the Fallback type parameter is honored over the default `never`
type _AsFallbackParam = Expect<Equal<SpecsDefaultAs<PlainSpec, 'div'>, 'div'>>

// a spec whose `defaults` is OPTIONAL does not satisfy the constraint —
// pinning the trap that made the previous assertion here vacuous
type _AsOptionalDefaults = Expect<
	Equal<SpecsDefaultAs<{ defaults?: { as: 'button' }; props: object }>, never>
>


// ---- IsPolymorphic / AsPolymorphic -----------------------------------

type _IsPolyTrue = Expect<Equal<IsPolymorphic<ButtonSpec>, true>>
type _IsPolyFalse = Expect<Equal<IsPolymorphic<PlainSpec>, false>>

// a polymorphic spec accepts `as`, narrowed to its own default tag
type _AsPropOpen = Expect<Equal<AsPolymorphic<ButtonSpec>, { as?: 'button' }>>

// a non-polymorphic spec closes the prop off entirely
type _AsPropClosed = Expect<Equal<AsPolymorphic<PlainSpec>, { as?: never }>>


// ---- SpecsDefaultProps ------------------------------------------------

// only keys that actually exist on `props` survive
type _DefaultPropsNarrow = Expect<
	Equal<SpecsDefaultProps<ButtonSpec>, 'size' | 'variant'>
>

// a declared default key that isn't a real prop is dropped, not surfaced
type _DefaultPropsDropsUnknown = Expect<
	Equal<
		SpecsDefaultProps<{
			defaults: { as: 'div'; props: 'size' | 'notAProp' }
			props: { size?: string }
		}>,
		'size'
	>
>

// no `defaults` means no default-able keys
type _DefaultPropsNone = Expect<Equal<SpecsDefaultProps<PlainSpec>, never>>


// ---- Compound specs --------------------------------------------------

// Positive control: a compound spec WITHOUT the styling keys is valid.
// If `Specs` ever stopped being exported, this line errors and the
// negative assertions below can no longer pass silently.
const _validCompound: Specs<{ onClick?: () => void }> = {
	isCompound: true,
	props: {},
}

// Kept on one line each: with a multi-line object literal TypeScript
// anchors the incompatibility to the offending property rather than to the
// declaration, so a directive above the `const` reads as unused and the
// assertion quietly stops asserting.

// @ts-expect-error compound specs disallow `classNames`
const _compoundClassNames: Specs<object> = { isCompound: true, props: {}, classNames: 'not-allowed' }

// @ts-expect-error compound specs disallow `styles`
const _compoundStyles: Specs<object> = { isCompound: true, props: {}, styles: { color: 'red' } }

// @ts-expect-error compound specs cannot declare a default tag
const _compoundDefaultAs: Specs<object> = { isCompound: true, props: {}, defaults: { as: 'div' } }


// ---- Token specs ------------------------------------------------------

type TokenSpec = {
	props: { size?: 'sm' | 'lg' }
	selectors: 'root' | 'icon'
	tokens: { root: '--gap' | '--pad' }
}

/** Declares `tokens` but no `selectors` — the `_AnySelector` fallback path. */
type NoSelectorsSpec = {
	props: object
	tokens: { root: '--gap' }
}

/** A token group keyed by a selector the spec never declares. */
type BadSelectorSpec = {
	props: object
	selectors: 'root'
	tokens: { bogus: '--gap' }
}


// ---- SpecsTokens / SpecsTokenGroups ----------------------------------

// the declared union becomes one required record per group, and the empty
// `Record<PropertyKey, never>` arm is what makes `return {}` legal
type _TokensResolve = Expect<Equal<
	SpecsTokens<TokenSpec>,
	{ root: Record<'--gap' | '--pad', TokenValue> } | TokensNever
>>

// `SpecsTokenGroups` is the same thing WITHOUT that empty arm
type _TokenGroupsResolve = Expect<Equal<
	SpecsTokenGroups<TokenSpec>,
	{ root: Record<'--gap' | '--pad', TokenValue> }
>>

/**
 * The load-bearing distinction, and the reason `defineTokens` builds its
 * exactness check on `SpecsTokenGroups` rather than `SpecsTokens`: `keyof`
 * over a union is the INTERSECTION of its members' keys, so the empty arm's
 * index signature would collapse the mapped type and silently disable the
 * whole check. `{}` satisfying one but not the other pins them apart.
 *
 * Positive control first — if `SpecsTokens` ever loses the empty arm, this
 * errors and the negative below can no longer pass vacuously.
 */
const _emptyIsATokenList: SpecsTokens<TokenSpec> = {}

// @ts-expect-error a token GROUP must carry every variable the spec declares
const _emptyIsNotAGroup: SpecsTokenGroups<TokenSpec> = {}

// a spec with no `tokens` key accepts nothing but the empty object
type _TokensAbsent = Expect<Equal<
	SpecsTokens<{ props: object; selectors: 'root' }>,
	TokensNever
>>

// `tokens` but no `selectors` → `_AnySelector` widens to `PropertyKey`, so the
// group is accepted rather than every key being rejected
type _TokensNoSelectors = Expect<Equal<
	SpecsTokenGroups<NoSelectorsSpec>,
	{ root: Record<'--gap', TokenValue> }
>>

// a group keyed by an undeclared selector resolves to a branded marker whose
// key IS the diagnostic the author sees
type _TokensBadSelector = Expect<Equal<
	SpecsTokenGroups<BadSelectorSpec>,
	{ bogus: { "selector 'bogus' is not declared in Specs['selectors']": never } }
>>

export type {
	_AsResolves,
	_AsFallsBack,
	_AsFallbackParam,
	_AsOptionalDefaults,
	_IsPolyTrue,
	_IsPolyFalse,
	_AsPropOpen,
	_AsPropClosed,
	_DefaultPropsNarrow,
	_DefaultPropsDropsUnknown,
	_DefaultPropsNone,
	_TokensResolve,
	_TokenGroupsResolve,
	_TokensAbsent,
	_TokensNoSelectors,
	_TokensBadSelector,
}
export { _validCompound, _compoundClassNames, _compoundStyles, _compoundDefaultAs }
export { _emptyIsATokenList, _emptyIsNotAGroup }
