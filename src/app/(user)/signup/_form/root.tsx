import { useState } from 'react'
import { useSignupCtx } from '../_utils/signup.context'
import { validateSignupForm } from '../_utils/schema'
import { AuthChoices } from '../_components/auth-choices'
import { Button } from '@/components/core/Button'
import { Field } from '@/components/form/Field'
import { Form } from '@/components/form/Form'
import { Icon } from '@/components/core/Icon'
import { PasswordRules } from '../_components/password'
import { Section } from '@/components/layout/Section'
import { PLACEHOLDER_EMAIL, PLACEHOLDER_TEL } from '@/lib/form'
import Link from 'next/link'

const FORM_ID = 'signup',
	FIELD_ID = `${FORM_ID}-field`

const SignupFields = () => {
	const {
		formReply: { pending, state },
		method, signup,
	} = useSignupCtx()

	const [password, setPassword] = useState('')
	const [lastState, setLastState] = useState(signup.state)

	if (signup.state !== lastState) {
		setLastState(signup.state)
		setPassword('')
	}

	return (
		<>
			<Field
				required
				disabled={ pending }
				id={ `${FIELD_ID}-${method}` }
				label={ method === 'tel' ? 'Phone number' : 'Email' }
				caption={ <AuthChoices /> }
			>
				{ method === 'tel' ? (
					<Field.Input
						autoComplete="tel"
						defaultValue={ state.values.tel }
						name="tel"
						placeholder={ PLACEHOLDER_TEL }
						type="tel"
					/>
				) : (
					<Field.Input
						autoComplete="email"
						defaultValue={ state.values.email }
						name="email"
						placeholder={ PLACEHOLDER_EMAIL }
						type="email"
					/>
				) }
			</Field>

			{ method === 'email' && (
				<Field
					required
					disabled={ pending }
					id={ `${FIELD_ID}-password` }
					label="Password"
					caption={ <PasswordRules value={ password } /> }
				>
					<Field.Input
						autoComplete="new-password"
						name="password"
						onChange={ event => setPassword(event.currentTarget.value) }
						placeholder="Your password"
						type="password"
					/>
				</Field>
			) }
		</>
	)
}

export const SignupRoot = () => {
	const {
		handleSignupFlow,
		formReply: { pending, state },
		magic, method, signup,
		pageID, screen,
	} = useSignupCtx()

	const getSignupButton = () => {
		switch (method) {
			case 'email':
				return {
					loading: signup.pending,
				}
			case 'magic':
				return {
					'data-intent': 'magic',
					formAction: magic.action,
					loading: magic.pending,
				}
			case 'tel':
				return {
					// intent: 'phone',
					// formAction: phone.action,
					loading: signup.pending,
				}
			default:
				return {}
		}
	}

	const submitProps = getSignupButton()

	return (
		<Section
			eyebrow="Create Account"
			id={ `${pageID}-${screen}` }
			layout="content-form"
			tabIndex={ -1 }
			title="Join Inkquest."
		>
			One account for finding artists, bidding on flash, and booking.

			<Form
				action={ signup.action }
				id={ FORM_ID }
				pending={ pending }
				state={ state }
				validate={ validateSignupForm }
			>
				<SignupFields />

				<div className="form__ctas authentication">
					<Button
						{ ...submitProps }
						fullWidth
						animate="right"
						className="authentication__email"
						type="submit"
					>
						{ method === 'magic' ? 'Send magic link' : 'Create account' }
						<Button.Section right><Icon type="arrow-right" /></Button.Section>
					</Button>

					<div className="authentication__label" role="presentation">
						<span>or</span>
					</div>

					<Button.Group
						fullWidth
						className="authentication__sso"
						hasPriority={ false }
					>
						<Button
							fullWidth
							onClick={ () => handleSignupFlow('success') }
							variant="outline"
						>
							<Button.Section><Icon type="google" /></Button.Section>
							Continue with Google
						</Button>
						<Button
							fullWidth
							onClick={ () => handleSignupFlow('success') }
							variant="outline"
						>
							<Button.Section><Icon type="apple" /></Button.Section>
							Continue with Apple
						</Button>
					</Button.Group>

					<div className="authentication__note">
						<p>By creating an account, you confirm you&apos;re 18+ and agree to the <Link href="/terms" data-link>Terms</Link> and <Link href="/privacy-policy" data-link>Privacy Policy</Link>.</p>
					</div>
				</div>
			</Form>
		</Section>
	)
}

SignupRoot.displayName = 'SignupRoot'
