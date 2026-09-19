'use client'

import { useCallback, useRef } from 'react'
import { useInView, useReducedMotion, type UseInViewOptions } from 'framer-motion'
import { REVEAL_INVIEW } from './constants'
import type { CSSProperties, RefObject } from 'react'

interface UseRevealOptions extends UseInViewOptions {
	animated?: boolean
	revealed?: boolean
	withinView?: boolean
}

interface RevealItemProps {
	'data-reveal-item'?: ''
	style?: CSSProperties
}

interface RevealRootProps {
	'data-js-reveal'?: ''
	'data-revealed'?: ''
}

interface RevealValue<T> {
	item: (index?: number) => RevealItemProps
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

	// index is caller-assigned, never derived from the DOM — heterogeneous
	// slots are built in visual order, so the caller is the only thing that
	// knows the order (see `orderReveal` in Section.tsx)
	const item = useCallback((index = 0): RevealItemProps => (
		animated
			? { 'data-reveal-item': '', style: { '--reveal-index': index } as CSSProperties }
			: {}
	), [animated])

	const root: RevealRootProps = animated
		? { 'data-js-reveal': '', ...visible ? { 'data-revealed': '' } as const : {} }
		: {}

	return { item, ref: node, root, visible: !animated || visible }
}
