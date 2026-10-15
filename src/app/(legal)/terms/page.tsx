'use client'

import { Progress } from '@/components/data/Progress'
import { Section } from '@/components/layout/Section'

export default function TermsConditions() {
	const pageID = 'terms-conditions'

	return (
		<>
			<Progress />
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
