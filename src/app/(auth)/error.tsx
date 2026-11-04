'use client'

import { startTransition, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/core/Button'
import { Section } from '@/components/layout/Section'

interface AuthErrorProps {
	error: Error & { digest?: string }
	reset: () => void
	unstable_retry: () => void
}

//	catches anything the auth pages throw that isn't a form reply
export default function AuthError({
	error,
	reset,
	unstable_retry,
}: AuthErrorProps) {
	const router = useRouter()

	useEffect(() => {
		console.error(error)
	}, [error])

	const handleRefresh = () => {
		startTransition(() => {
			router.refresh()
			reset()
		})
	}

	return (
		<Section
			eyebrow="Error"
			layout="content-form"
			title="Something went wrong."
		>
			Try again, or reload the page.

			<div className="authentication">
				<div className="authentication__error">
					<span>ERROR</span>
					<code>{ error.message }</code>
				</div>

				<div className="authentication__note">
					<Button.Group hasPriority="reverse">
						<Button onClick={ handleRefresh }>Refresh</Button>
						<Button onClick={ () => unstable_retry() }>Try again</Button>
					</Button.Group>
				</div>
			</div>
		</Section>
	)
}
