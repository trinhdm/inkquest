import { useSignupCtx } from '../_utils/signup.context'
import { AuthForm } from '../../_components/AuthForm'
import { Field } from '@/components/form/Field'

export const SignupSuccess = () => {
	const {
		destination, idx, method,
		waitUntilExpiry,
	} = useSignupCtx()

	const isPhone = method === 'phone'

	return (
		<AuthForm idx={ idx } onSubmit={ waitUntilExpiry }>
			<AuthForm.Header eyebrow="Success!" title="Account created.">
				You&apos;re in. A two-minute setup tunes your feed, search, and profile.
			</AuthForm.Header>

			{ !!destination && (
				<Field
					readonly
					id={ `${idx.field}-to` }
					label={ isPhone ? 'Phone number' : 'Email' }
					layout="inline"
				>
					<Field.Input
						defaultValue={ destination }
						name={ isPhone ? 'tel' : 'email' }
						type={ isPhone ? 'tel' : 'email' }
					/>
				</Field>
			) }

			<AuthForm.Footer>
				<AuthForm.Continue href="/community/feed">Start setup</AuthForm.Continue>

				<AuthForm.Note>
					<p>Setup takes about two minutes — styles, location, and (for artists) your shop.</p>
				</AuthForm.Note>
			</AuthForm.Footer>
		</AuthForm>
	)
}

SignupSuccess.displayName = 'SignupSuccess'
