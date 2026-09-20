import type { UseInViewOptions } from 'framer-motion'

export const DEFAULT_INVIEW = .75

export interface AnimationOptions
	extends UseInViewOptions {
	animated?: boolean
	duration?: number
	index?: number
	revealed?: boolean
	stagger?: number
	unstyled?: boolean
	withinView?: boolean
}
