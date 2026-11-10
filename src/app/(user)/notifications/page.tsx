'use client'

import { Section } from '@/components/layout/Section'

export default function Notifications() {
	const pageID = 'notifications'

	return (
		<>
			<Section
				id={ `${pageID}-hero` }
				layout="hero"
				title="Notifications"
			>
				notifications
			</Section>
		</>
	)
}
