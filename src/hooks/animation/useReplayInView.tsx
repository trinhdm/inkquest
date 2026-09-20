'use client'

import { useState, type RefObject } from 'react'
import { useInView, type UseInViewOptions } from 'framer-motion'
import { DEFAULT_INVIEW } from './constants'

// arms at `amount` visible, but only disarms once *no* part of the element is
// on screen — so a consumer that replays on re-entry does its reset out of sight
// rather than snapping while the element is still partially visible
export const useReplayInView = <T extends Element = Element>(
	ref: RefObject<T | null>,
	options: UseInViewOptions = {}
): boolean => {
	const {
		amount = DEFAULT_INVIEW,
		margin,
		once = false,
		...rest
	} = options

	// deliberately no `margin` — the reset must happen once the element
	// is *truly* off screen, not at the shifted trigger line
	const armed = useInView(ref, { amount, margin, once, ...rest }),
		onScreen = useInView(ref, { amount: 'some', ...rest })

	const [active, setActive] = useState(false)

	let next = active
	if (armed) next = true
	else if (!onScreen) next = false

	if (!once && next !== active) setActive(next)

	return once ? armed : next
}
