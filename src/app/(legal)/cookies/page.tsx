'use client'

import { Section } from '@/components/layout'

export default function Cookies() {
	const pageID = 'cookies'

	return (
		<>
			<Section
				id={ `${pageID}-hero` }
				layout="hero"
				title="Cookies"
			>
				content
			</Section>
		</>
	)
}
