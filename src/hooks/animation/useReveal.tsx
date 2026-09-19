'use client'

import { useCallback, useRef } from 'react'
import { useInView, useReducedMotion, type UseInViewOptions } from 'framer-motion'
import { REVEAL_DATAKEYS, REVEAL_INVIEW } from './constants'
import type { RefObject } from 'react'

interface UseRevealOptions extends UseInViewOptions {
	animated?: boolean
	revealed?: boolean
	withinView?: boolean
}

interface RevealRootProps {
	[REVEAL_DATAKEYS.root.base]?: ''
	[REVEAL_DATAKEYS.root.active]?: ''
}

export interface RevealItemProps {
	[REVEAL_DATAKEYS.child]?: `${number}`
}

// indices are handed out in the order the caller builds its slots, never read
// back from the DOM — heterogeneous slots are partitioned before they render,
// so the caller is the only thing that knows the final order
export interface RevealCounter {
	/** consumes one index and returns the attribute bag for a slot */
	next: () => RevealItemProps
	/** reserves `total` indices and returns the first; `undefined` when not animated */
	reserve: (total: number) => number | undefined
}

interface RevealValue<T> {
	item: (index: number) => RevealItemProps
	orderReveal: () => RevealCounter
	ref: RefObject<T | null>
	root: RevealRootProps
	visible: boolean
}

// the index travels as the attribute's value — `extractOtherProps` strips
// `style` off components, but an unrecognised `data-*` prop reaches the DOM
export const revealItem = (
	index: number,
	target = REVEAL_DATAKEYS.child,
): RevealItemProps =>
	({ [target]: `${index}` })

// the receiving half of `RevealCounter.reserve()`: the child at `index` within a
// range reserved from `from`. `from` is `undefined` when the parent isn't
// animated, and is checked with `typeof` rather than truthiness because a
// reserved range can legitimately start at 0
export const revealItemFrom = (
	index: number,
	from?: number,
): RevealItemProps =>
	typeof from === 'number' ? revealItem(from + index) : {}

export const useReveal = <T extends HTMLElement = HTMLElement>({
	amount = REVEAL_INVIEW,
	animated = true,
	once = true,
	revealed,
	withinView,
	...rest
}: UseRevealOptions = {}): RevealValue<T> => {
	const node = useRef<T>(null),
		idle = useRef<T>(null)

	// when a parent supplies the trigger, keep our own observer idle by handing
	// `useInView` a ref that is never attached to anything (see `useCountUp`)
	const observer = typeof withinView === 'boolean' ? idle : node,
		inView = useInView(observer, { amount, once, ...rest })

	// belt-and-braces: the CSS `@media` block is the primary reduced-motion
	// guard, since this returns `null` during SSR
	const reducedMotion = useReducedMotion()

	const visible = revealed ?? withinView ?? (!!reducedMotion || inView)
	const { root: dataRoot } = REVEAL_DATAKEYS

	// index is caller-assigned, never derived from the DOM — heterogeneous
	// slots are built in visual order, so the caller is the only thing that
	// knows the order (see `orderReveal` in Section.tsx)
	const item = useCallback((index: number = 0): RevealItemProps => (
		animated ? revealItem(index) : {}
	), [animated])

	// hands back a FRESH counter on every call — call it once per render. Never
	// hold the counter itself in a ref or memo: its cursor would carry over into
	// the next render (and StrictMode's double render), starting that pass at N
	const orderReveal = useCallback((): RevealCounter => {
		let cursor = 0

		return {
			next: () => item(cursor++),
			// `undefined` when not animated, so `ButtonGroup`'s `deriveReveal` emits nothing
			reserve: total => {
				if (!animated) return
				const from = cursor
				cursor += total
				return from
			},
		}
	}, [animated, item])


	const attributes: RevealRootProps = animated
		? {
			[dataRoot.base]: '',
			...(visible ? { [dataRoot.active]: '' } as const : {}),
		}
		: {}

	return {
		item,
		orderReveal,
		ref: node,
		root: attributes,
		visible: !animated || visible,
	}
}
