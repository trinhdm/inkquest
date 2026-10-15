import { base } from '../../reference'
import type { SizeRangeX } from '@/types/shared'
import type { TokenSizeShape, TokenVariableShape } from '../../types'

export interface BreakpointTokens
	extends TokenSizeShape<SizeRangeX> {
	min: string
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
	block: string
	page: string
}

export const getContainerTokens = (): ContainerTokens => ({
	block: base.screen('600'),
	page: base.screen('1280'),
})

interface LayoutItemTokens {
	// gap: {
	// 	kicker: string
	// 	lede: string
	// 	cta: string
	// }
	padding: string
}

export interface GridTokens {
	gutter: {
		base: TokenVariableShape
		content: TokenVariableShape
		item: TokenVariableShape
		list: TokenVariableShape
	}

	indent: {
		list: TokenVariableShape
	}

	hero: LayoutItemTokens
	section: LayoutItemTokens

	stack: {
		gap: {
			kicker: string
			head: string
			lede: string
			cta: string
		}
		padding: string
	}

	footer: {
		padding: TokenVariableShape
	}

	navbar: { size: string }
	subnav: { size: string }

	field: {
		gap: TokenVariableShape
		padding: TokenSizeShape
	}

	// paragraph: {
	// 	gap: TokenVariableShape
	// }
}

export const getGridTokens = (): GridTokens => {
	const start = 5,
		step = 2,
		stack = Array.from({ length: 4 }, (_, i) => (start + (i * step)))

	return {
		gutter: {
			base: base.space('10'),
			content: base.space('4'),
			item: base.space('3'),
			list: base.space('2'),
		},

		indent: {
			list: base.space('5'),
		},

		stack: {
			gap: {
				kicker: base.space(`${stack[0]}`),
				head: base.space(`${stack[3]}`),
				lede: base.space(`${stack[1]}`),
				cta: base.space(`${stack[2]}`),
			},
			padding: base.space('15'),
		},

		hero: {
			padding: base.space('16'),
		},

		section: {
			padding: base.space('15'),
		},

		footer: {
			padding: `${base.space('12')} ${base.space('10')}`,
		},

		navbar: { size: base.space('13') },
		subnav: { size: base.space('10') },

		// paragraph: {
		// 	gap: contentGutter,
		// },

		field: {
			gap: base.space('3'),
			padding: {
				sm: base.space('2'),
				md: base.space('3'),
				lg: base.space('4'),
			},
		},
	}
}
