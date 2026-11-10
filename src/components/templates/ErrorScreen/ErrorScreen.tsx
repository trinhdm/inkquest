'use client'

import {
	useEffect, useTransition,
	type ReactElement, type ReactNode,
} from 'react'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/core/Button'
import { Section } from '@/components/layout/Section'
import { Icon } from '@/components/core/Icon'
import styles from './error-screen.module.scss'

interface ErrorButtons {
	back: ReactElement
	retry: ReactElement
}

interface ErrorScreenProps {
	actions?: (buttons: ErrorButtons) => ReactNode
	description?: Section.Props['children']
	eyebrow?: Section.Props['eyebrow']
	error: Error & { digest?: string }
	reset: () => void
	title?: Section.Props['title']
}

export const ErrorScreen = ({
	actions,
	description = 'Try again, or go back.',
	error,
	eyebrow = 'Error',
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

	const buttons = {
		back: (
			<Button
				animate="left"
				onClick={ handleBack }
				variant="ghost"
			>
				Back
				<Button.Section left><Icon type="arrow-left" /></Button.Section>
			</Button>
		),
		retry: (
			<Button
				animate="right"
				loading={ isPending }
				onClick={ handleRetry }
			>
				Try again
				<Button.Section right><Icon type="arrow-right" /></Button.Section>
			</Button>
		),
	}

	return (
		<Section
			eyebrow={ eyebrow }
			layout="content-form"
			title={ title }
		>
			{ description }

			<div className={ styles.error }>
				{ process.env.NODE_ENV === 'development' && (
					<div className={ styles.message }>
						<span>Error</span>
						<code>{ error.digest ?? error.message }</code>
					</div>
				) }

				<div className={ styles.actions }>
					<Button.Group hasPriority={ false }>
						{ actions ? actions(buttons) : <>{ buttons.back }{ buttons.retry }</> }
					</Button.Group>
				</div>
			</div>
		</Section>
	)
}

ErrorScreen.displayName = 'ErrorScreen'

export declare namespace ErrorScreen {
	export type Props = ErrorScreenProps
}
