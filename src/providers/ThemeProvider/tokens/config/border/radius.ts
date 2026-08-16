import { tokn } from '../../ref'

export interface BorderRadiusTokens {
	none: string
	sm: string
	md: string
	lg: string
	pill: string
}

export const getBorderRadiusTokens = (): BorderRadiusTokens => ({
	none: tokn.radius('01'),
	sm: tokn.radius('02'),
	md: tokn.radius('03'),
	lg: tokn.radius('04'),
	pill: tokn.radius('05'),
})
