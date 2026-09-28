'use client'

import { Section } from '@/components/layout/Section'

export default function PrivacyPolicy() {
	const pageID = 'privacy-policy'

	return (
		<>
			<Section
				id={ `${pageID}-hero` }
				layout="hero"
				title="Privacy Policy"
			>
				content
			</Section>
		</>
	)
}
