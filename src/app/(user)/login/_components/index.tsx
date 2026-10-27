'use client'

import { useActionState, useEffect, useRef, useState } from 'react'
import { initFormState, PLACEHOLDER_EMAIL } from '@/lib/form'
import { login, requestReset } from '../_utils/actions'
import { Button } from '@/components/core/Button'
import { Field } from '@/components/form/Field'
import { Grid } from '@/components/layout/Grid'
import { Icon } from '@/components/core/Icon'
import { LoginForm } from './form'
import { Section } from '@/components/layout/Section'
import { Form } from '@/components/form/Form'
import { validateReset } from '../_utils/schema'

type LoginStage =
	| 'email' | 'magic' | 'sso'
	| 'forgot' | 'reset'
	| 'success'

export const LoginBase = () => {
	const [state, formAction, pending] = useActionState(login, initFormState)
	const [stage, setStage] = useState<LoginStage>('email')

	const screen: LoginStage = state.success ? 'success' : stage
	const lastScreen = useRef(screen)

	const [resetState, resetAction, resetPending] = useActionState(requestReset, initFormState)
	const [lastReset, setLastReset] = useState(resetState)
	const [resent, setResent] = useState(false)

	// a successful reply: the first one moves to "check your inbox",
	// later ones come from "Resend link" on that screen, which stays put
	if (resetState !== lastReset) {
		setLastReset(resetState)

		if (resetState.success) {
			setResent(stage === 'reset')
			setStage('reset')
		}
	}

	const email = state.values.email || PLACEHOLDER_EMAIL,
		emailReset = resetState.values.email || PLACEHOLDER_EMAIL

	const pageID = 'login'
	let formID = `form-${pageID}`,
		fieldID = `${formID}-field`

	useEffect(() => {
		if (lastScreen.current === screen) return
		lastScreen.current = screen
		document.getElementById(`${pageID}-${screen}`)?.focus()
	}, [screen])

	const handleLoginFlow = (next: LoginStage) => { setStage(next) }

	const sendResetLink = () => {
		setResent(true)
		setTimeout(() => setResent(false), 30000)
	}

	if (screen === 'success') {
		formID = `form-${pageID}-${screen}`
		fieldID = `${formID}-field`

		return (
			<Section
				eyebrow="Success!"
				id={ `${pageID}-${screen}` }
				layout="content-form"
				tabIndex={ -1 }
				title="Logged in."
			>
				Welcome back — your feed is where you left it.

				<Grid as="form" columns={ 1 } id={ formID }>
					<Field
						id={ `${fieldID}-email-login` }
						label="Email"
						layout="inline"
					>
						<Field.Input
							readonly
							name={ `${formID}-email-login` }
							type="email"
							value={ email }
						/>
					</Field>

					<Button animate="right" href="/community/feed">
						Go to your feed
						<Button.Section right><Icon type="arrow-right" /></Button.Section>
					</Button>
				</Grid>
			</Section>
		)
	}

	if (screen === 'magic') {
		formID = `form-${pageID}-${screen}`
		fieldID = `${formID}-field`

		return (
			<Section
				eyebrow="Magic Link"
				id={ `${pageID}-${screen}` }
				layout="content-form"
				tabIndex={ -1 }
				title="Check your inbox"
			>
				<>
					We emailed a sign-in link to { email }. It expires in 15 minutes.
				</>

				<Grid as="form" columns={ 1 } id={ formID }>
					<Field
						id={ `${fieldID}-magic-link` }
						label="Email"
						labelPosition="last"
						layout="inline"
						caption="Didn't arrive? Check spam, or resend below."
					>
						<Field.Input
							readonly
							name={ `${formID}-magic-link` }
							type="email"
							value={ email }
						/>
					</Field>

					<Button.Group hasPriority="reverse">
						<Button animate="left" onClick={ () => handleLoginFlow('email') }>
							Back
							<Button.Section left><Icon type="arrow-left" /></Button.Section>
						</Button>
						<Button type="submit">
							Resend link
						</Button>
					</Button.Group>
				</Grid>
			</Section>
		)
	}

	if (screen === 'reset') {
		formID = `form-${pageID}-${screen}`
		fieldID = `${formID}-field`

		return (
			<Section
				eyebrow="Check your inbox"
				id={ `${pageID}-${screen}` }
				layout="content-form"
				tabIndex={ -1 }
				title="Reset link sent"
			>
				<>
					If an account exists for { emailReset }, a link to reset your password is on its way. It expires in 30 minutes.
				</>

				<Form
					action={ resetAction }
					id={ formID }
					onSubmit={ sendResetLink }
					pending={ resetPending }
					state={ {
						errors: resetState.errors,
						formError: resetState.formError,
						message: resent ? `We sent another link to ${emailReset}.` : undefined,
					} }
				>
					<Field
						id={ `${fieldID}-email-reset` }
						label="Email"
						labelPosition="last"
						layout="inline"
						caption="Didn't arrive? Check spam, or resend below."
					>
						<Field.Input
							readonly
							defaultValue={ emailReset }
							name="email"
							type="email"
						/>
					</Field>

					<Button
						animate="left"
						onClick={ () => handleLoginFlow('email') }
					>
						Back to log in
						<Button.Section left><Icon type="arrow-left" /></Button.Section>
					</Button>

					<div className="authentication__note">
						{ resent ? (
							<span>Resend available in</span>
						) : (
							<Button unstyled data-link loading={ resetPending } type="submit">
								Resend link
							</Button>
						) }
						<span>·</span>
						<Button unstyled data-link onClick={ () => handleLoginFlow('forgot') }>
							Wrong email?
						</Button>
					</div>
				</Form>
			</Section>
		)
	}

	if (screen === 'forgot') {
		formID = `form-${pageID}-${screen}`
		fieldID = `${formID}-field`

		return (
			<Section
				eyebrow="Reset password"
				id={ `${pageID}-${screen}` }
				layout="content-form"
				tabIndex={ -1 }
				title="Forgot your password?"
			>
				Enter the email on your account and we&apos;ll send a link to set a new one.

				<Form
					action={ resetAction }
					id={ formID }
					onSubmit={ sendResetLink }
					pending={ resetPending }
					state={ resetState }
					validate={ validateReset }
				>
					<Field
						required
						id={ `${fieldID}-reset-password` }
						label="Email"
					>
						<Field.Input
							autoComplete="email"
							defaultValue={ resetState.values.email }
							name="email"
							placeholder={ PLACEHOLDER_EMAIL }
							type="email"
						/>
					</Field>

					<Button.Group hasPriority={ false }>
						<Button
							animate="left"
							onClick={ () => handleLoginFlow('email') }
							variant="ghost"
						>
							Back
							<Button.Section left><Icon type="arrow-left" /></Button.Section>
						</Button>
						<Button animate="right" loading={ resetPending } type="submit">
							Send reset link
							<Button.Section right><Icon type="arrow-right" /></Button.Section>
						</Button>
					</Button.Group>
				</Form>
			</Section>
		)
	}

	return (
		<Section
			eyebrow="Log In"
			id={ `${pageID}-${screen}` }
			layout="content-form"
			tabIndex={ -1 }
			title="Welcome back."
		>
			Pick up where you left off.

			<LoginForm
				action={ formAction }
				onForgotPass={ () => handleLoginFlow('forgot') }
				onMagicLink={ () => handleLoginFlow('magic') }
				onSSO={ () => handleLoginFlow('success') }
				pending={ pending }
				state={ state }
			/>
		</Section>
	)
}

LoginBase.displayName = 'LoginBase'
