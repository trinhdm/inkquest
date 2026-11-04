'use client'

import { useEffect, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/core/Button'
import { Section } from '@/components/layout/Section'
import { Icon } from '@/components/core/Icon'

interface AuthErrorProps {
	error: Error & { digest?: string }
	reset: () => void
}

//	catches anything the auth pages throw that isn't a form reply
export default function AuthError({ error, reset }: AuthErrorProps) {
	const [isPending, startTransition] = useTransition()
	const router = useRouter()

	useEffect(() => {
		console.error(error)
	}, [error])

	const handleBack = () => {
		if (window.history.length > 1) router.back()
		else router.push('/')
	}

	const handleRetry = () => {
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
			Try again, or go back.

			<div className="authentication">
				<div className="authentication__error">
					<span>ERROR</span>
					<code>{ error.message }</code>
				</div>

				<div className="authentication__note">
					<Button.Group hasPriority={ false }>
						<Button
							animate="left"
							onClick={ handleBack }
							variant="ghost"
						>
							Back
							<Button.Section left><Icon type="arrow-left" /></Button.Section>
						</Button>
						<Button
							animate="right"
							loading={ isPending }
							onClick={ handleRetry }
						>
							Try again
							<Button.Section right><Icon type="arrow-right" /></Button.Section>
						</Button>
					</Button.Group>
				</div>
			</div>
		</Section>
	)
}
