import { useParser } from '@/hooks/useParser'
import { keyHasValue } from '@/utils/helpers'
import { Section } from '@/components/layout/Section'
import { SEPARATOR } from '@/utils/constants'
import type { AddressData } from '@/types/shared'
import type { LegalPageData } from '../_utils/legal.types'

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

export const LegalFooter = ({ company_info, footer, id: pageID }: LegalPageData) => {
	const footerBody = useParser(footer?.body)

	if (!footer) return null

	const { legal_name: company } = company_info
	const { contact_email: email, recipient } = footer

	const address = formatAddress(company_info.address),
		contact = [company, recipient, address]

	return (
		<Section id={ `${pageID}-footer` }>
			<div className="footnote">
				<h2 className="footnote__label">{ footer.heading }</h2>
				<div className="footnote__content">
					{ footerBody }
					<a href={ `mailto:${email}` }>{ email }</a>
					<span>{ contact.join(SEPARATOR) }</span>
				</div>
			</div>
		</Section>
	)
}

LegalFooter.displayName = 'LegalFooter'
