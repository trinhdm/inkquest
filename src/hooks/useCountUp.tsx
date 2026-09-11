'use client'

import {
	useCallback, useRef, type RefCallback,
	useEffect, useMemo, useState,
} from 'react'
import {
	animate, type ValueAnimationTransition,
	useInView, type UseInViewOptions,
	useIsomorphicLayoutEffect, useReducedMotion,
} from 'framer-motion'

interface UseCountUpOptions
	extends UseInViewOptions {
	duration?: number
	enabled?: boolean
	start?: number
	value: number | string
}

interface ParsedValue {
	end: number
	format: (num: number) => string
}

interface CountUpValue<T> {
	display: string
	ref: RefCallback<T>
}

// regex matches:
// 	1. a leading prefix
// 		(optional - anything but a # digit or - sign)
// 	2. the numeric core
// 		(with optional comma separator, decimal point)
// 	3. an optional, trailing suffix
const VALUE_PATTERN = /^([^\d-]*)(-?[\d,]*\.?\d+)(.*)$/
// so '$9.2M', '12,400+', '38', and '4.8' all match the same pattern

// returns `null` when `value` has no parseable number (e.g. '—')
// will be treated as static (animation will not proceed)
const parseCountValue = (count: string): ParsedValue | null => {
	const match = count.match(VALUE_PATTERN)

	if (!match) return null

	const [, prefix, core, suffix] = match,
		clean = core.replace(/,/g, ''),
		end = parseFloat(clean)

	if (Number.isNaN(end)) return null

	const dot = clean.indexOf('.'),
		decimals = dot > -1 ? clean.length - dot - 1 : 0

	const toRound = new Intl.NumberFormat('en-US', {
		minimumFractionDigits: decimals,
		maximumFractionDigits: decimals,
		useGrouping: core.includes(','),
	})

	const format = (num: number): string =>
		prefix + toRound.format(num) + suffix

	return { end, format }
}

export const useCountUp = <T extends HTMLElement = HTMLElement>({
	amount = 0.4,
	duration = 2000,
	enabled = true,
	once = true,
	start = 0,
	value,
	...rest
}: UseCountUpOptions): CountUpValue<T> => {
	const count = String(value)
	const parsed = useMemo(() => parseCountValue(count), [count])
	const [display, setDisplay] = useState(() => count)

	const node = useRef<T | null>(null)
	const ref = useCallback<RefCallback<T>>(el => { node.current = el }, [])

	const inView = useInView(node, { amount, once, ...rest })
	const reducedMotion = useReducedMotion()

	useIsomorphicLayoutEffect(() => {
		if (!parsed)
			return setDisplay(count)
		else if (!enabled || reducedMotion)
			return setDisplay(parsed.format(parsed.end))
		setDisplay(parsed.format(start))
	}, [count, enabled, parsed, reducedMotion, start])

	useEffect(() => {
		if (reducedMotion || !enabled || !parsed || !inView) return

		const options: ValueAnimationTransition<number> = {
			duration: duration / 1000,
			ease: [0.16, 1, 0.3, 1],
			onUpdate: n => setDisplay(parsed.format(n)),
		}
		const controls = animate(start, parsed.end, options)

		return () => controls.stop()
	}, [duration, enabled, inView, parsed, reducedMotion, start])

	return { display, ref }
}
