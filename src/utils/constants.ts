import type { AddressData } from '@/types/shared'

export const SEPARATOR = ' · '
export const COMPANY_NAME = 'Inkquest'

export const COMPANY_INFO = {
	legal_name: `${COMPANY_NAME}, Inc.`,
	address: {
		street_line1: '550 Bryant Street',
		street_line2: 'Suite 400',
		city: 'San Francisco',
		state: 'CA',
		zip: '94107',
		country: 'US',
	},
} as const satisfies {
	legal_name: string
	address: AddressData
}

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? ''

export const PREFIX_CSS_SELECTOR = 'inkq'
export const PREFIX_CSS_VARS = '--css-prefix'

export const MONTH_NAMES = [
	'January', 'February', 'March', 'April',
	'May', 'June', 'July', 'August',
	'September', 'October', 'November', 'December',
] as const

export const SOCIAL_BRANDS = [
	'facebook',
	'instagram',
	'pinterest',
	'tiktok',
	'x',
] as const
