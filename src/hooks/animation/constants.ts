import type { UseInViewOptions } from 'framer-motion'

export const DEFAULT_INVIEW = .75
export const REVEAL_MARGIN = '0px 0px -12% 0px'
export const REPLAY_REVEAL = {
	amount: 'some',
	margin: REVEAL_MARGIN,
} as const

export interface AnimationOptions {
	animated?: boolean
	duration?: number
	index?: number
	stagger?: number
	unstyled?: boolean
	withinView?: boolean
}

export interface AnimationInViewOptions
	extends AnimationOptions, UseInViewOptions {}

interface AnimatedComponentProps
	extends UseInViewOptions {
	animated: true
	duration: number
	index?: number
	stagger?: number
	withinView?: boolean
}

interface StaticComponentProps
	extends Partial<Record<keyof UseInViewOptions, never>> {
	animated?: false | never
	duration?: never
	index?: never
	stagger?: never
	withinView?: never
}

export type MaybeAnimationProps =
	| AnimatedComponentProps
	| StaticComponentProps
