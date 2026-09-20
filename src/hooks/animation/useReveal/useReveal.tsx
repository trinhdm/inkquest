'use client'

import { useCallback, useEffect, useRef, useState, type RefObject } from 'react'
import { useReducedMotion } from 'framer-motion'
import { useReplayInView } from '../useReplayInView'
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
	once = false,
	revealed,
	withinView,
	...props
}: UseRevealOptions = {}): RevealValue<T> => {
	const { duration, stagger, ...rest } = props
	const { others } = extractOtherProps(rest)

	const {
		child: dataChild,
		root: dataRoot,
	} = REVEAL_DATAKEYS

	const [settled, setSettled] = useState(false)

	const node = useRef<T>(null),
		idle = useRef<T>(null),
		observer = typeof withinView === 'boolean' ? idle : node

	const reducedMotion = useReducedMotion(),	// guard is primarily handled by `@media` block
		inView = useReplayInView(observer, { amount, once, ...rest })

	// pin the section hidden rather than deferring to the observer
	const triggered = revealed ?? withinView ?? (!!reducedMotion || inView),
		visible = !animated || triggered

	const isAnimated = animated && !rest.unstyled,
		isVisible = !isAnimated || visible

	useEffect(() => {
		const el = node.current
		let cancelled = false

		if (!el) return
		else if (!visible) return setSettled(false)   // only reachable when `once: false`

		// the transitions start in the commit that adds `data-revealed`, so wait a
		// frame — queried in the same tick, `getAnimations` returns an empty list
		const frame = requestAnimationFrame(() => {
			const running = el.getAnimations({ subtree: true }).filter(anim => {
				const { effect } = anim,
					{ target } = (effect ?? { target: null }) as KeyframeEffect

				return effect instanceof KeyframeEffect
					&& target instanceof Element
					&& target.matches(`[${dataChild}]`)
					&& target.closest(`[${dataRoot.base}]`) === el	// skip nested root's items
			})

			if (!running.length) return setSettled(true)

			// `allSettled`, not `all` — `finished` REJECTS on an interrupted transition
			Promise.allSettled(running.map(anim => anim.finished))
				.then(() => { if (!cancelled) setSettled(true) })
		})

		return () => {
			cancelled = true
			cancelAnimationFrame(frame)
		}
	}, [visible])

	const item = useCallback((index: number = 0): RevealItemProps => (
		isAnimated ? revealItem(index) : {}
	), [isAnimated])

	// hands back a FRESH counter on every call — call it once per render
	// neveer hold the counter itself in a ref or memo: its `index` would carry over into
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

	const attributes: RevealRootProps = isAnimated
		? {
			[dataRoot.base]: '',
			...(visible && !settled ? { [dataRoot.active]: '' } as const : {}),
			...(settled ? { [dataRoot.settled]: '' } as const : {}),
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
