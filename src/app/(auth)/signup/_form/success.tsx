import { useSignupCtx } from '../_utils/signup.context'
import { AuthForm } from '../../_components/AuthForm'
import { Field } from '@/components/form/Field'
import { NavRoutes } from '@/utils/navigation'
import { METHOD_DATA } from '../_utils/signup.data'

export const SignupSuccess = () => {
	const {
		destination, guardSubmit, idx,
		method: { active: method },
	} = useSignupCtx()

	const { field: { label, type } } = METHOD_DATA[method]

	return (
		<AuthForm idx={ idx } onSubmit={ guardSubmit }>
			<AuthForm.Header eyebrow="Success!" title="Account created.">
				You&apos;re in. A two-minute setup tunes your feed, search, and profile.
			</AuthForm.Header>

			{ !!destination && (
				<Field
					readonly
					id={ `${idx.field}-to` }
					label={ label }
					layout="inline"
				>
					<Field.Input
						defaultValue={ destination }
						name={ type }
						type={ type }
					/>
				</Field>
			) }

			<AuthForm.Footer>
				<AuthForm.Continue href={ NavRoutes.USER_ONBOARDING } label="Start setup" />

				<AuthForm.Note>
					<p>Setup takes about two minutes — styles, location, and (for artists) your shop.</p>
				</AuthForm.Note>
			</AuthForm.Footer>
		</AuthForm>
	)
}

SignupSuccess.displayName = 'SignupSuccess'
