import { alias, base } from '../../reference'
import type { TokenVariableShape } from '../../types'

export interface BreakpointTokens {
	min: string
	xs: string
	sm: string
	md: string
	lg: string
	xl: string
	max: string
}

export const getBreakpointTokens = (): BreakpointTokens => ({
	min: base.screen('320'),
	xs: base.screen('480'),
	sm: base.screen('768'),
	md: base.screen('1024'),
	lg: base.screen('1280'),
	xl: base.screen('1440'),
	max: base.screen('1920'),
})

export interface ContainerTokens {
	app: {
		width: string
		padding: string
		// gap: string
		// background: string
		// radius: string
	},
	// card: {
	// 	width: string
	// 	padding: string
	// 	gap: string
	// 	background: string
	// 	radius: string
	// }
}

// screen width -> content width
export const getContainerTokens = (): ContainerTokens => ({
	app: {
		width: alias.breakpoint('lg'),
		padding: `${base.size('48')} ${base.size('40')}`,
	},
})

export const getComponentTokens = () => ({
	control: {
		// width: alias.breakpoint('lg'),
		// padding: `${base.size('48')} ${base.size('40')}`,
		border: alias.border('strong'),
		background: alias.background.card(),
		color: alias.color.text('primary'),	//active
	},
	tile: {
		// width: alias.breakpoint('lg'),
		// padding: `${base.size('48')} ${base.size('40')}`,
		border: alias.border(),
		background: `linear-gradient(135deg, var(--ink-4), var(--ink-1))`,
	},
})


export interface GridTokens {
	container: {
		app: string
		page: string
		compact: string
	}
}

// screen width -> content width
export const getGridTokens = (): GridTokens => ({
	container: {
		app: alias.breakpoint('lg'),
	}
})
