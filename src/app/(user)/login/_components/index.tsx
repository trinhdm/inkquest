'use client'

import { useState } from 'react'
import { Button } from '@/components/core/Button'
import { Field } from '@/components/form/Field'
import { Grid } from '@/components/layout/Grid'
import { Icon } from '@/components/core/Icon'
import { LoginForm } from './form'
import { Section } from '@/components/layout/Section'

type LoginStage =
	| 'email' | 'magic' | 'sso'
	| 'forgot' | 'reset'
	| 'success'

export const LoginBase = () => {
	const [stage, setStage] = useState<LoginStage>('email')

		const pageID = 'login'
		let formID = `form-${pageID}`,
			fieldID = `${formID}-field`

		const handleLoginFlow = (next: LoginStage) => {
			setStage(next)
		}

		if (stage === 'success') {
			formID = `form-${pageID}-${stage}`
			fieldID = `${formID}-field`

			return (
				<Section
					eyebrow="Success!"
					id={ `${pageID}-${stage}` }
					layout="content-form"
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
								value="you@example.com"
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

		if (stage === 'magic') {
			formID = `form-${pageID}-${stage}`
			fieldID = `${formID}-field`

			return (
				<Section
					eyebrow="Magic Link"
					id={ `${pageID}-${stage}` }
					layout="content-form"
					title="Check your inbox"
				>
					We emailed a sign-in link to scout.finch@gmail.com. It expires in 15 minutes.

					<Grid as="form" columns={ 1 } id={ formID }>
						<Field
							id={ `${fieldID}-magic-link` }
							label="Email"
							labelPosition="last"
							layout="inline"
							caption="Didn’t arrive? Check spam, or resend below."
						>
							<Field.Input
								readonly
								name={ `${formID}-magic-link` }
								type="email"
								value="you@example.com"
							/>
						</Field>

						<Button.Group hasPriority="reverse">
							<Button animate="left" onClick={ () => handleLoginFlow('email') }>
								Back
								<Button.Section left><Icon type="arrow-left" /></Button.Section>
							</Button>
							<Button href="/community/feed">
								Resend link
							</Button>
						</Button.Group>
					</Grid>
				</Section>
			)
		}

		if (stage === 'reset') {
			formID = `form-${pageID}-${stage}`
			fieldID = `${formID}-field`

			return (
				<Section
					eyebrow="Check your inbox"
					id={ `${pageID}-${stage}` }
					layout="content-form"
					title="Reset link sent"
				>
					If an account exists for scout.finch@gmail.com, a link to reset your password is on its way. It expires in 30 minutes.

					<Grid as="form" columns={ 1 } id={ formID }>
						<Field
							id={ `${fieldID}-email-reset` }
							label="Email"
							labelPosition="last"
							layout="inline"
							caption="Didn’t arrive? Check spam, or resend below."
						>
							<Field.Input
								readonly
								name={ `${formID}-email-reset` }
								type="email"
								value="you@example.com"
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
							<Button unstyled data-link onClick={ () => handleLoginFlow('forgot') }>
								Resend link
							</Button>
							<span>·</span>
							<Button unstyled data-link onClick={ () => handleLoginFlow('forgot') }>
								Wrong email?
							</Button>
						</div>
					</Grid>
				</Section>
			)
		}

		if (stage === 'forgot') {
			formID = `form-${pageID}-${stage}`
			fieldID = `${formID}-field`

			return (
				<Section
					eyebrow="Reset password"
					id={ `${pageID}-${stage}` }
					layout="content-form"
					title="Forgot your password?"
				>
					Enter the email on your account and we’ll send a link to set a new one.

					<Grid as="form" columns={ 1 } id={ formID }>
						<Field
							required
							id={ `${fieldID}-reset-password` }
							label="Email"
						>
							<Field.Input
								autoComplete="email"
								name={ `${formID}-reset-password` }
								placeholder="you@example.com"
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
							<Button
								animate="right"
								onClick={ () => handleLoginFlow('reset') }
							>
								Send reset link
								<Button.Section right><Icon type="arrow-right" /></Button.Section>
							</Button>
						</Button.Group>
					</Grid>
				</Section>
			)
		}

		return (
			<Section
				eyebrow="Log In"
				id={ `${pageID}-${stage}` }
				layout="content-form"
				title="Welcome back."
			>
				Pick up where you left off.

				<LoginForm
					onForgotPass={ () => handleLoginFlow('forgot') }
					onMagicLink={ () => handleLoginFlow('magic') }
					onSSO={ () => handleLoginFlow('success') }
				/>
			</Section>
		)
}

LoginBase.displayName = 'LoginBase'
