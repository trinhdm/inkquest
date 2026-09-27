'use client'

import Link from 'next/link'
import { Section } from '@/components/layout'

export default function Support() {
	const pageID = 'support'

	return (
		<>
			<Section
				eyebrow="Contact"
				id={ `${pageID}-hero` }
				layout="hero"
				title="Talk to a human."
			>
				Pick who you are and what it's about — we'll route it to the right person. Quick question? The <Link href="/faqs">FAQs</Link> might already have it.
			</Section>
		</>
	)
}
