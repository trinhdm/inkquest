'use client'

import { Section } from '@/components/layout/Section'

export default function Messages() {
	const pageID = 'messages'

	return (
		<>
			<Section
				id={ `${pageID}-hero` }
				layout="hero"
				title="Messages"
			>
				messages
			</Section>
		</>
	)
}
