import Link from 'next/link'
import { useState } from 'react'
import { useSignupCtx, type SignupMethod } from '../_utils/signup.context'
import { validateSignup } from '../_utils/schema'
import { AuthForm } from '../../_components/AuthForm'
import { Field } from '@/components/form/Field'
import { PasswordRules } from '../_components/password'
import { SignupOptions } from '../_components/options'
import { PLACEHOLDER } from '@/lib/form'

const SUBMIT_LABELS = {
	email:	'Create account',
	magic:	'Send magic link',
	phone:	'Send code',
} as const satisfies Record<SignupMethod, string>

export const SignupRoot = () => {
	const {
		idx, method, waiting,
		signup: { action, pending, state },
	} = useSignupCtx()

	const [password, setPassword] = useState('')
	const [lastState, setLastState] = useState(state)

	if (state !== lastState) {
		setLastState(state)
		setPassword('')
	}

	return (
		<AuthForm
			action={ action }
			idx={ idx }
			pending={ pending }
			state={ state }
			validate={ validateSignup }
		>
			<AuthForm.Header eyebrow="Sign Up" title="Join Inkquest.">
				One account for finding artists, bidding on flash, and booking.
			</AuthForm.Header>

			<input name="method" type="hidden" value={ method } />

			<Field
				required
				disabled={ pending }
				id={ `${idx.field}-${method}` }
				label={ method === 'phone' ? 'Phone number' : 'Email' }
				caption={ <SignupOptions /> }
			>
				{ method === 'phone' ? (
					<Field.Input
						autoComplete="tel"
						defaultValue={ state.values.tel }
						key="tel"
						name="tel"
						placeholder={ PLACEHOLDER.tel }
						type="tel"
					/>
				) : (
					<Field.Input
						autoComplete="email"
						defaultValue={ state.values.email }
						key="email"
						name="email"
						placeholder={ PLACEHOLDER.email }
						type="email"
					/>
				) }
			</Field>

			{ method === 'email' && (
				<>
					<input hidden autoComplete="username" name="username" ng-hide="true" type="text" />

					<Field
						required
						disabled={ pending }
						id={ `${idx.field}-password` }
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
				</>
			) }

			<AuthForm.Footer>
				<AuthForm.Submit
					fullWidth
					disabled={ waiting }
					loading={ pending }
					name="method"
					value={ method }
				>
					{ SUBMIT_LABELS[method] }
				</AuthForm.Submit>

				<AuthForm.SSO verb="continue" />

				<AuthForm.Note>
					<p>By creating an account, you confirm you&apos;re 18+ and agree to the <Link href="/terms" data-link>Terms</Link> and <Link href="/privacy-policy" data-link>Privacy Policy</Link>.</p>
				</AuthForm.Note>
			</AuthForm.Footer>
		</AuthForm>
	)
}

SignupRoot.displayName = 'SignupRoot'
