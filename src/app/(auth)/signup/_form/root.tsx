import Link from 'next/link'
import { useSignupCtx } from '../_utils/signup.context'
import { validateSignup } from '../_utils/schema'
import { AuthForm } from '../../_components/AuthForm'
import { ContactField } from '../_components/ContactField'
import { NavRoutes } from '@/utils/navigation'
import { PasswordField } from '../_components/PasswordField'
import { METHOD_DATA } from '../_utils/signup.data'

export const SignupRoot = () => {
	const {
		idx, method, navigate,
		signup: { action, pending, state },
	} = useSignupCtx()

	const { submit } = METHOD_DATA[method.active]

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

			<input name="method" type="hidden" value={ method.active } />
			<ContactField />
			<PasswordField />

			<AuthForm.Footer>
				<AuthForm.Submit
					fullWidth
					label={ submit }
					loading={ pending }
				/>

				<AuthForm.Alternate
					as="SSO"
					disabled={ pending }
					label="continue"
					onClick={ () => navigate('success') }
				/>

				<AuthForm.Note>
					<p>By creating an account, you confirm you&apos;re 18+ and agree to the <Link href={ NavRoutes.LEGAL_TERMS } data-link>Terms</Link> and <Link href={ NavRoutes.LEGAL_PRIVACY } data-link>Privacy Policy</Link>.</p>
				</AuthForm.Note>
			</AuthForm.Footer>
		</AuthForm>
	)
}

SignupRoot.displayName = 'SignupRoot'
