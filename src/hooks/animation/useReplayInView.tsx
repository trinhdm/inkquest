'use client'

import { useEffect, useState, type RefObject } from 'react'
import { useInView, type UseInViewOptions } from 'framer-motion'
import { INVIEW_DEFAULTS } from '@/utils/constants'

// arms at `amount` visible, but only disarms once *no* part of the element is
// on screen — so a consumer that replays on re-entry does its reset out of sight
// rather than snapping while the element is still partially visible
export const useReplayInView = <T extends Element = Element>(
	ref: RefObject<T | null>,
	{ amount = INVIEW_DEFAULTS, once = false, ...rest }: UseInViewOptions = {}
): boolean => {
	const armed = useInView(ref, { amount, once, ...rest }),
		onScreen = useInView(ref, { amount: 'some', ...rest })

	const [active, setActive] = useState(false)

	useEffect(() => {
		if (once) return
		if (armed) setActive(true)
		else if (!onScreen) setActive(false)
	}, [armed, once, onScreen])

	return once ? armed : active
}
