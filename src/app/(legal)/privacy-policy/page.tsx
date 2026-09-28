'use client'

import { Section } from '@/components/layout/Section'

export default function TermsConditions() {
	const pageID = 'terms-conditions'

	return (
		<>
			<Section
				id={ `${pageID}-hero` }
				layout="hero"
				title="Terms & Conditions"
			>
				content
			</Section>
		</>
	)
}
