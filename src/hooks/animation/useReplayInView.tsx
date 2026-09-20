'use client'

import { useState, type RefObject } from 'react'
import { useInView } from 'framer-motion'
import { revealMargin, type ReplayInViewOptions } from './constants'

// arms at the trigger line, but only disarms once *no* part of the element is
// on screen — so a consumer that replays on re-entry does its reset out of sight
// rather than snapping while the element is still partially visible
export const useReplayInView = <T extends Element = Element>(
	ref: RefObject<T | null>,
	options: ReplayInViewOptions = {}
): boolean => {
	const {
		amount,
		lead,
		margin,
		once = false,
		...rest
	} = options

	const trigger = amount ?? 'some',
		triggerMargin = margin ?? (amount === undefined ? revealMargin(lead) : undefined)

	const [active, setActive] = useState(false)
	const armed = useInView(ref, { amount: trigger, margin: triggerMargin, once, ...rest }),
		onScreen = useInView(ref, { amount: 'some', ...rest })

	let next = active
	if (armed) next = true
	else if (!onScreen) next = false

	if (!once && next !== active) setActive(next)

	return once ? armed : next
}
