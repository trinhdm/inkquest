'use client'

import { Section } from '@/components/layout/Section'

export default function YourCircle() {
	const pageID = 'your-circle'

	return (
		<>
			<Section
				id={ `${pageID}-hero` }
				layout="hero"
				title="Your Circle"
			>
				your circle
			</Section>
		</>
	)
}
