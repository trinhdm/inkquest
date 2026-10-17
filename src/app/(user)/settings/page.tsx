'use client'

import { Section } from '@/components/layout/Section'

export default function Settings() {
	const pageID = 'settings'

	return (
		<>
			<Section
				id={ `${pageID}-hero` }
				layout="hero"
				title="Settings"
			>
				settings
			</Section>
		</>
	)
}
