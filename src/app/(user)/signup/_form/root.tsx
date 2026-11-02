import Link from 'next/link'
import { useSignupCtx, type SignupMethod } from '../_utils/signup.context'
import { validateSignup } from '../_utils/schema'
import { AuthForm } from '../../_components/AuthForm'
import { Field } from '@/components/form/Field'
import { PasswordField } from '../_components/PasswordField'
import { SignupOptions } from '../_components/options'
import { PLACEHOLDER } from '@/lib/form'

const SUBMIT_LABELS = {
	email:	'Create account',
	magic:	'Send magic link',
	phone:	'Send code',
} as const satisfies Record<SignupMethod, string>

export const SignupRoot = () => {
	const {
		idx, method,
		signup: { action, pending, state },
	} = useSignupCtx()

	const isPhoneAuth = method === 'phone',
		type = isPhoneAuth ? 'tel' : 'email'

	return (
		<AuthForm
			action={ action }
			feedback="eager"
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
				label={ isPhoneAuth ? 'Phone number' : 'Email' }
				caption={ <SignupOptions /> }
			>
				<Field.Input
					autoComplete={ type }
					defaultValue={ state.values[type] }
					key={ type }
					name={ type }
					placeholder={ PLACEHOLDER[type] }
					type={ type }
				/>
			</Field>

			<PasswordField />

			<AuthForm.Footer>
				<AuthForm.Submit
					fullWidth
					label={ SUBMIT_LABELS[method] }
					loading={ pending }
				/>

				<AuthForm.SSO label="continue" />

				<AuthForm.Note>
					<p>By creating an account, you confirm you&apos;re 18+ and agree to the <Link href="/terms" data-link>Terms</Link> and <Link href="/privacy-policy" data-link>Privacy Policy</Link>.</p>
				</AuthForm.Note>
			</AuthForm.Footer>
		</AuthForm>
	)
}

SignupRoot.displayName = 'SignupRoot'
