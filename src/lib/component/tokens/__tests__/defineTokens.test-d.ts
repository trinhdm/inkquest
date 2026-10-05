/**
 * Type-level tests for the `defineTokens` token contract.
 *
 * These assert at compile time only — there is no runtime body, and Jest
 * never picks the file up (its default `testMatch` looks for `*.test.ts`,
 * not `*.test-d.ts`). `npm run test:types` is what executes them: a failed
 * assertion is a type error, so the script exits non-zero.
 *
 * WHY THIS FILE EXISTS. TypeScript does not run excess-property checks on an
 * object literal returned from a callback whose return type is only
 * *contextually* typed. While `defineTokens` took the callback directly, a
 * component could declare one CSS variable in its `Tokens` type and return
 * four, and nothing complained — `Field` had drifted to exactly that. The
 * fix is the curried signature: the first call carries the spec, the second
 * INFERS the returned shape, and `ExactTokens` compares the two. Everything
 * below pins that behaviour, so the hole cannot quietly reopen.
 *
 * `@ts-expect-error` swallows *any* error on the next line, including a typo
 * or a missing import, which silently turns the assertion into a no-op. Each
 * one below is therefore paired with a positive control that would break if
 * the symbol under test disappeared, and each subject line is kept on ONE
 * line: with a multi-line literal TypeScript anchors the error to the
 * offending property instead of the statement, so the directive reads as
 * unused and the assertion stops asserting.
 *
 * Note that an unused `@ts-expect-error` is itself an error, which makes the
 * negative assertions here self-verifying.
 */
import { defineTokens } from '../defineTokens'
import type { TokensList } from '../../factory/types'

type TokenSpec = {
	props: { size?: 'sm' | 'lg' }
	selectors: 'root' | 'icon'
	tokens: { root: '--gap' | '--pad' }
}

/** Token variable missing the `--` prefix — malformed at the declaration. */
type MalformedSpec = {
	props: object
	selectors: 'root'
	tokens: { root: 'gap' }
}

/** Mirrors Accordion's shared helper: annotated, so it checks its own literal. */
const getSharedTokens = (size?: string): TokensList<TokenSpec['tokens']> =>
	!size ? {} : { root: { '--gap': '1rem', '--pad': '2rem' } }


// ---- Accepted shapes -------------------------------------------------
//
// These are the positive controls. They also pin the `R extends object` +
// distributive `ExactTokens` design: the stricter `R extends SpecsTokens<S>`
// constraint rejects every one of the union-returning forms below, so if
// someone "tightens" that constraint these fail first.

// the ordinary case — every declared variable, nothing more
const _valid = defineTokens<TokenSpec>()(({ props }) => ({ root: { '--gap': props.size ? '1rem' : undefined, '--pad': '2rem' } }))

// a group may be omitted entirely
const _empty = defineTokens<TokenSpec>()(() => ({}))

// early return makes `R` a union; the check must distribute over it
const _guarded = defineTokens<TokenSpec>()(({ props }) => { if (!props.size) return {}; return { root: { '--gap': '1rem', '--pad': '2rem' } } })

// same union, expressed as a ternary
const _ternary = defineTokens<TokenSpec>()(({ props }) => props.size ? { root: { '--gap': '1rem', '--pad': '2rem' } } : {})

// delegating to an already-annotated helper
const _delegated = defineTokens<TokenSpec>()(({ props }) => getSharedTokens(props.size))


// ---- Rejected shapes -------------------------------------------------

// @ts-expect-error '--nope' is not in the spec's declared token union
const _undeclaredToken = defineTokens<TokenSpec>()(() => ({ root: { '--gap': '1rem', '--pad': '2rem', '--nope': '3rem' } }))

// @ts-expect-error an extra variable is still caught when `R` is a union — the distribution guard
const _undeclaredAfterGuard = defineTokens<TokenSpec>()(({ props }) => { if (!props.size) return {}; return { root: { '--gap': '1rem', '--pad': '2rem', '--nope': '3rem' } } })

// @ts-expect-error a present group must carry EVERY declared variable
const _missingToken = defineTokens<TokenSpec>()(() => ({ root: { '--gap': '1rem' } }))

// @ts-expect-error token values are `number | string | undefined`, never boolean
const _badValue = defineTokens<TokenSpec>()(() => ({ root: { '--gap': true, '--pad': '2rem' } }))

// @ts-expect-error 'label' is a real selector but carries no declared tokens
const _strayGroup = defineTokens<TokenSpec>()(() => ({ label: { '--gap': '1rem' } }))

// @ts-expect-error a token variable must be a `--` custom property
const _malformedVar = defineTokens<MalformedSpec>()(() => ({}))

export {
	_valid,
	_empty,
	_guarded,
	_ternary,
	_delegated,
	_undeclaredToken,
	_undeclaredAfterGuard,
	_missingToken,
	_badValue,
	_strayGroup,
	_malformedVar,
}
