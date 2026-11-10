'use client'

import { Section } from '@/components/layout/Section'

export default function Onboarding() {
	const pageID = 'onboarding'

	return (
		<>
			<Section
				id={ `${pageID}-hero` }
				layout="hero"
				title="Onboarding"
			>
				onboarding
			</Section>
		</>
	)
}
