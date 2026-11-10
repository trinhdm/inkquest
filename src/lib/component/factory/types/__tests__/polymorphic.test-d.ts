/**
 * Type-level tests for `PolymorphicProps` — how `as` and `ref` resolve for
 * each kind of tag `C`.
 *
 * Compile-time only, like `specs.test-d.ts`: Jest never picks this file up,
 * and `npm run test:types` is what runs it. A failed assertion is a type
 * error. Every `@ts-expect-error` is paired with a positive control, for the
 * reason given at the top of `specs.test-d.ts`.
 *
 * The case that matters most is the open tag. Stories type their `args` as
 * `Parameters<typeof X>[0]`, which fills `C` with its constraint
 * (`ElementType`), not the component's default tag. Those args still have to
 * spread onto the component with a specific `as`, so the open tag's `ref`
 * must be passable to any element's ref.
 */
import type { ElementType, Ref, RefObject } from 'react'
import type { PolymorphicProps } from '../polymorphic.types'
import type { DEFAULT_TAG } from '../../constants'

/** Exact equality — defeats the usual bidirectional-assignability fudge. */
type Equal<A, B> =
	(<T>() => T extends A ? 1 : 2) extends (<T>() => T extends B ? 1 : 2)
		? true : false

type Expect<T extends true> = T

/** Plain component props with no `as` or `ref` of their own. */
type TestProps = { label?: string }

/** Props that declare their own `as`, which wins over the tag `C`. */
type OwnAsProps = { as?: 'a' | 'button' }

type OpenTag = PolymorphicProps<TestProps, ElementType>
type UlTag = PolymorphicProps<TestProps, 'ul'>
type TableTag = PolymorphicProps<TestProps, 'table'>
type NoTag = PolymorphicProps<TestProps, undefined>

declare const openArgs: OpenTag
declare const ulRef: RefObject<HTMLUListElement | null>
declare const tableRef: RefObject<HTMLTableElement | null>
declare const inputRef: RefObject<HTMLInputElement | null>


// ---- open tag (`ElementType`) -----------------------------------------

// `any`, not `unknown`: the element isn't known yet, so the ref has to be
// passable to whichever tag is picked later
type _OpenRefIsAny = Expect<Equal<OpenTag['ref'], Ref<any> | undefined>>

// the story pattern: `<X { ...args } as="ul" />`
const _openArgsToUl: UlTag = { ...openArgs, as: 'ul' }


// ---- listed tag (in `TagDictionary`) ----------------------------------

type _UlRef = Expect<Equal<UlTag['ref'], Ref<HTMLUListElement> | undefined>>

// positive control for the negative below
const _ulTakesUlRef: UlTag['ref'] = ulRef

// @ts-expect-error a `ul` must not accept an `input` ref
const _ulRejectsInputRef: UlTag['ref'] = inputRef


// ---- unlisted tag (not in `TagDictionary`) ----------------------------

// `_ElementTag` falls back to `unknown` here, but the tag's own JSX `ref`
// still applies through `_ElementProps`, so a wrong ref is still caught

// positive control for the negative below
const _tableTakesTableRef: TableTag['ref'] = tableRef

// @ts-expect-error a `table` must not accept an `input` ref
const _tableRejectsInputRef: TableTag['ref'] = inputRef


// ---- no tag (`undefined`, reachable through `Box`) --------------------

// `_TagName` swaps in `DEFAULT_TAG`, matching `Box`'s runtime `as || DEFAULT_TAG`
type _NoTagAs = Expect<Equal<NoTag['as'], typeof DEFAULT_TAG | undefined>>

type _NoTagRef = Expect<Equal<
	NoTag['ref'],
	Ref<HTMLElementTagNameMap[typeof DEFAULT_TAG]> | undefined
>>


// ---- props with their own `as` ----------------------------------------

// `P['as']` is used as is, even when `C` is the open tag
type _OwnAsWins = Expect<Equal<
	PolymorphicProps<OwnAsProps, ElementType>['as'],
	'a' | 'button' | undefined
>>

export type {
	_OpenRefIsAny,
	_UlRef,
	_NoTagAs,
	_NoTagRef,
	_OwnAsWins,
}
export { _openArgsToUl }
export { _ulTakesUlRef, _ulRejectsInputRef }
export { _tableTakesTableRef, _tableRejectsInputRef }
