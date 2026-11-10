'use client'

import { Section } from '@/components/layout/Section'

export default function Profile() {
	const pageID = 'profile'

	return (
		<>
			<Section
				id={ `${pageID}-hero` }
				layout="hero"
				title="Profile"
			>
				profile
			</Section>
		</>
	)
}
