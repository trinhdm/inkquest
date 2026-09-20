'use client'

import { useCallback, useRef, type RefObject } from 'react'
import { useInView, useReducedMotion, type UseInViewOptions } from 'framer-motion'
import { extractOtherProps } from '../../useProps'
import {
	revealItem, REVEAL_DATAKEYS, REVEAL_INVIEW,
	type RevealCounter, type RevealItemProps, type RevealRootProps,
} from './helpers'
import type { AnimationOptions } from '../constants'

interface UseRevealOptions
	extends AnimationOptions {}

interface RevealValue<T> {
	item: (index: number) => RevealItemProps
	others: ReturnType<typeof extractOtherProps>['others'] & RevealRootProps
	ref: RefObject<T | null>
	reveal: () => RevealCounter
	visible: boolean
}

export const useReveal = <T extends HTMLElement = HTMLElement>({
	amount = REVEAL_INVIEW,
	animated = true,
	once = true,
	revealed,
	withinView,
	...props
}: UseRevealOptions = {}): RevealValue<T> => {
	const { duration, stagger, ...rest } = props

	const node = useRef<T>(null),
		idle = useRef<T>(null)

	// when a parent supplies the trigger, keep our own observer idle by handing
	// `useInView` a ref that is never attached to anything (see `useCountUp`)
	const observer = typeof withinView === 'boolean' ? idle : node,
		inView = useInView(observer, { amount, once, ...rest })

	// belt-and-braces: the CSS `@media` block is the primary reduced-motion
	// guard, since this returns `null` during SSR
	const reducedMotion = useReducedMotion()

	const visible = revealed ?? withinView ?? (!!reducedMotion || inView),
		isAnimated = animated && !rest.unstyled,
		isVisible = !isAnimated || visible

	const item = useCallback((index: number = 0): RevealItemProps => (
		isAnimated ? revealItem(index) : {}
	), [isAnimated])

	// hands back a FRESH counter on every call — call it once per render. Never
	// hold the counter itself in a ref or memo: its `index` would carry over into
	// the next render (and StrictMode's double render), starting that pass at N
	const orderReveal = useCallback((): RevealCounter => {
		let index = 0

		return {
			next: () => item(index++),
			reserve: total => {
				if (!isAnimated) return
				const from = index
				index += total
				return from
			},
		}
	}, [isAnimated, item])

	const { root: dataRoot } = REVEAL_DATAKEYS
	const { others } = extractOtherProps(rest)

	const attributes: RevealRootProps = isAnimated
		? {
			[dataRoot.base]: '',
			...(visible ? { [dataRoot.active]: '' } as const : {}),
		}
		: {}

	return {
		item,
		others: { ...others, ...attributes },
		ref: node,
		reveal: orderReveal,
		visible: isVisible,
	}
}
