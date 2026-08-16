import { base } from '../../reference'

export interface BorderRadiusTokens {
	none: string
	sm: string
	md: string
	lg: string
	pill: string
}

export const getBorderRadiusTokens = (): BorderRadiusTokens => ({
	none: base.radius('01'),
	sm: base.radius('02'),
	md: base.radius('03'),
	lg: base.radius('04'),
	pill: base.radius('05'),
})
