import type { UseInViewOptions } from 'framer-motion'

export const DEFAULT_INVIEW = .75

interface BaseAnimationOptions {
	animated?: boolean
	duration?: number
	index?: number
	stagger?: number
	unstyled?: boolean
	withinView?: boolean
}

export interface AnimationOptions
	extends BaseAnimationOptions, UseInViewOptions {}

interface AnimatedComponentProps
	extends UseInViewOptions {
	animated: true
	duration: number
	stagger?: number
}

interface StaticComponentProps
	extends Partial<Record<keyof UseInViewOptions, never>> {
	animated?: false | never
	duration?: never
	stagger?: never
}

export type MaybeAnimationProps =
	| AnimatedComponentProps
	| StaticComponentProps
