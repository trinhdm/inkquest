import type { UseInViewOptions } from 'framer-motion'

export const DEFAULT_INVIEW = .75
export const REVEAL_LEAD = -4

export const revealMargin = (lead: number = REVEAL_LEAD): UseInViewOptions['margin'] =>
	`0px 0px ${lead}% 0px` as UseInViewOptions['margin']

export interface AnimationOptions {
	animated?: boolean
	duration?: number
	index?: number
	stagger?: number
	unstyled?: boolean
}

export interface AnimateInViewConfig
	extends AnimationOptions {
	withinView?: boolean
}

export interface ReplayInViewConfig
	extends UseInViewOptions {
	lead?: number
}

export interface ReplayAnimateInViewConfig
	extends AnimateInViewConfig,
		ReplayInViewConfig {}

interface AnimatedComponentProps
	extends ReplayInViewConfig {
	animated: true
	duration: number
	index?: number
	stagger?: number
	withinView?: boolean
}

interface StaticComponentProps
	extends Partial<Record<keyof ReplayInViewConfig, never>> {
	animated?: false | never
	duration?: never
	index?: never
	stagger?: never
	withinView?: never
}

export type MaybeAnimationProps =
	| AnimatedComponentProps
	| StaticComponentProps
