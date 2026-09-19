'use client'

import { useCallback, useRef, type RefObject } from 'react'
import { useInView, useReducedMotion, type UseInViewOptions } from 'framer-motion'
import {
	revealItem, REVEAL_DATAKEYS, REVEAL_INVIEW,
	type RevealCounter, type RevealItemProps, type RevealRootProps,
} from './helpers'

interface UseRevealOptions extends UseInViewOptions {
	animated?: boolean
	revealed?: boolean
	withinView?: boolean
}

interface RevealValue<T> {
	item: (index: number) => RevealItemProps
	orderReveal: () => RevealCounter
	ref: RefObject<T | null>
	root: RevealRootProps
	visible: boolean
}

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
