'use client'

import { useEffect, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/core/Button'
import { Section } from '@/components/layout/Section'
import { Icon } from '@/components/core/Icon'
import './error-screen.scss'

interface ErrorScreenProps {
	description?: Section.Props['children']
	eyebrow?: Section.Props['eyebrow']
	error: Error & { digest?: string }
	hasBack?: boolean
	hasRetry?: boolean
	reset: () => void
	title?: Section.Props['title']
}

export const ErrorScreen = ({
	description = 'Try again, or go back.',
	error,
	eyebrow = 'Error',
	hasBack = true,
	hasRetry = true,
	reset,
	title = 'Something went wrong.',
}: ErrorScreenProps) => {
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

	const backButton = hasBack ? (
		<Button
			animate="left"
			onClick={ handleBack }
			variant="ghost"
		>
			Back
			<Button.Section left><Icon type="arrow-left" /></Button.Section>
		</Button>
	) : null

	const retryButton = hasRetry ? (
		<Button
			animate="right"
			loading={ isPending }
			onClick={ handleRetry }
		>
			Try again
			<Button.Section right><Icon type="arrow-right" /></Button.Section>
		</Button>
	) : null

	const buttons = [backButton, retryButton].filter(Boolean)

	return (
		<Section
			eyebrow={ eyebrow }
			layout="content-form"
			title={ title }
		>
			{ description }

			<div className="error-screen">
				<div className="error-screen__message">
					<span>ERROR</span>
					<code>{ error.digest ?? error.message }</code>
				</div>

				<div className="error-screen__actions">
					{ buttons.length > 1 ? (
						<Button.Group hasPriority={ false }>
							{ buttons }
						</Button.Group>
					) : buttons }
				</div>
			</div>
		</Section>
	)
}

ErrorScreen.displayName = 'ErrorScreen'

export declare namespace ErrorScreen {
	export type Props = ErrorScreenProps
}
