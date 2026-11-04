'use client'

import { Button } from '@/components/core/Button'
import { Section } from '@/components/layout/Section'

interface AuthErrorProps {
	error: Error & { digest?: string }
	unstable_retry: () => void
}

//	catches anything the auth pages throw that isn't a form reply
export default function AuthError({ unstable_retry }: AuthErrorProps) {
	return (
		<Section
			eyebrow="Error"
			layout="content-form"
			title="Something went wrong."
		>
			<p>This page hit a problem. Try again, or reload the page.</p>
			<Button onClick={ () => unstable_retry() }>Try again</Button>
		</Section>
	)
}
