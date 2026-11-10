import { useParser } from '@/hooks/useParser'
import { keyHasValue } from '@/utils/helpers'
import { Section } from '@/components/layout/Section'
import { SEPARATOR } from '@/utils/constants'
import type { AddressData } from '@/types/shared'
import type { LegalPageData } from '../_utils/legal.types'
import type { RequireSome } from '@/types/utils'

const ADDRESS_PARTS = [
	['street_line1', 'street_line2'],
	['city', 'state', 'zip'],
] as const

const formatAddress = (data: AddressData) =>
	ADDRESS_PARTS.reduce((lines, keys) => {
		const line = keys.reduce((str, k, i) => {
			if (keyHasValue(data, k)) {
				let value = data[k]
				if ((i < keys.length - 1) && k !== 'state') value += ','
				str += ` ${value}`
			}
			return str
		}, '')
		return [...lines, line]
	}, [] as string[]).join(SEPARATOR)

export const LegalFooter = ({
	company_info,
	footer,
	id: pageID,
}: RequireSome<LegalPageData, 'footer'>) => {
	const { legal_name: company } = company_info
	const { contact_email: email, recipient } = footer

	const address = formatAddress(company_info.address),
		contact = [company, recipient, address]

	return (
		<Section
			id={ `${pageID}-${footer.id}` }
			layout={ footer.layout ?? 'banner-note' }
			title={ footer.heading }
		>
			{ useParser(footer.body) }
			<a href={ `mailto:${email}` }>{ email }</a>
			<span>{ contact.join(SEPARATOR) }</span>
		</Section>
	)
}

LegalFooter.displayName = 'LegalFooter'
