'use client'

import { useActionState, useEffect, useRef, useState } from 'react'
import { initFormState } from '@/lib/form'
import { signup } from '../_utils/actions'
import { Button } from '@/components/core/Button'
import { Field } from '@/components/form/Field'
import { Grid } from '@/components/layout/Grid'
import { Icon } from '@/components/core/Icon'
import { Section } from '@/components/layout/Section'
import { SignupForm } from './form'

type SignupStage =
	| 'join' | 'verify' | 'sso' | 'success'

export const SignupBase = () => {
	const [signupState, signupAction, signupPending] = useActionState(signup, initFormState)
	const [stage, setStage] = useState<SignupStage>('join')

	const screen: SignupStage = signupState.success ? 'success' : stage
	const lastScreen = useRef(screen)

	const pageID = 'signup'
	let formID = `form-${pageID}`,
		fieldID = `${formID}-field`

	useEffect(() => {
		if (lastScreen.current === screen) return
		lastScreen.current = screen
		document.getElementById(`${pageID}-${screen}`)?.focus()
	}, [screen])

	const handleSignupFlow = (next: SignupStage) => { setStage(next) }

	if (screen === 'success') {
		formID = `form-${pageID}-${stage}`
		fieldID = `${formID}-field`

		return (
			<Section
				eyebrow="Success!"
				id={ `${pageID}-${stage}` }
				layout="content-form"
				title="Account created."
			>
				You&apos;re in. A two-minute setup tunes your feed, search, and profile.

				<Grid as="form" columns={ 1 } id={ formID }>
					<Field
						id={ `${fieldID}-email-signup` }
						label="Email"
						layout="inline"
					>
						<Field.Input
							readonly
							name={ `${formID}-email-signup` }
							type="email"
							value="you@example.com"
						/>
					</Field>

					<Button animate="right" href="/community/feed">
						Start setup
						<Button.Section right><Icon type="arrow-right" /></Button.Section>
					</Button>

					<div className="authentication__note">
						<p>Setup takes about two minutes — styles, location, and (for artists) your shop.</p>
					</div>
				</Grid>
			</Section>
		)
	}

	if (screen === 'verify') {
		formID = `form-${pageID}-${stage}`
		fieldID = `${formID}-field`

		return (
			<Section
				eyebrow="Verify Email"
				id={ `${pageID}-${stage}` }
				layout="content-form"
				title="Check your email"
			>
				We sent a 6-digit code to scout.finch@gmail.com. Enter it below.

				<Grid as="form" columns={ 1 } id={ formID }>
					{/* <Field.Group layout="keypad" legend="">
						<Field id={ `${fieldID}-code-1` } label="1">
							<Field.Number
								name={ `${formID}-code-1` }
								inputmode="numeric"
								type="text"
							/>
						</Field>

						<Field id={ `${fieldID}-code-2` } label="2">
							<Field.Number
								name={ `${formID}-code-2` }
								inputmode="numeric"
								type="text"
							/>
						</Field>

						<Field id={ `${fieldID}-code-3` } label="3">
							<Field.Number
								name={ `${formID}-code-3` }
								inputmode="numeric"
								type="text"
							/>
						</Field>

						<Field id={ `${fieldID}-code-4` } label="4">
							<Field.Number
								name={ `${formID}-code-4` }
								inputmode="numeric"
								type="text"
							/>
						</Field>

						<Field id={ `${fieldID}-code-5` } label="5">
							<Field.Number
								name={ `${formID}-code-5` }
								inputmode="numeric"
								type="text"
							/>
						</Field>

						<Field id={ `${fieldID}-code-6` } label="6">
							<Field.Number
								name={ `${formID}-code-6` }
								inputmode="numeric"
								type="text"
							/>
						</Field>
					</Field.Group> */}

					<Field id={ `${fieldID}-code-1` }>
						<Field.Number
							name={ `${formID}-code-1` }
							inputmode="numeric"
							type="text"
						/>
					</Field>

					<Field id={ `${fieldID}-code-2` }>
						<Field.Number
							name={ `${formID}-code-2` }
							inputmode="numeric"
							type="text"
						/>
					</Field>

					{/* <input
						type="text"
						inputMode="numeric"
						maxLength={ 1 }
						pattern="\d{6}"
						autoComplete="one-time-code"
						required
					/> */}

					<Button.Group hasPriority={ false }>
						<Button
							animate="left"
							onClick={ () => handleSignupFlow('join') }
							variant="ghost"
						>
							Back
							<Button.Section left><Icon type="arrow-left" /></Button.Section>
						</Button>
						<Button
							animate="right"
							onClick={ () => handleSignupFlow('success') }
						>
							Verify
							<Button.Section right><Icon type="arrow-right" /></Button.Section>
						</Button>
					</Button.Group>

					<div className="authentication__note">
						<Button unstyled data-link onClick={ () => handleSignupFlow('join') }>
							Resend code
						</Button>
						<span>·</span>
						<Button unstyled data-link onClick={ () => handleSignupFlow('join') }>
							Wrong email?
						</Button>
					</div>
				</Grid>
			</Section>
		)
	}

	return (
		<Section
			eyebrow="Create Account"
			id={ `${pageID}-${stage}` }
			layout="content-form"
			title="Join Inkquest."
		>
			One account for finding artists, bidding on flash, and booking.

			<SignupForm
				action={ signupAction }
				onSSO={ () => handleSignupFlow('success') }
				pending={ signupPending }
				state={ signupState }
			/>
		</Section>
	)
}

SignupBase.displayName = 'SignupBase'
