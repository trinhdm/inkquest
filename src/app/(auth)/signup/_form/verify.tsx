import { useSignupCtx } from '../_utils/signup.context'
import { validateResend } from '../_utils/schema'
import { AuthForm } from '../../_components/AuthForm'
import { CodeField } from '../_components/CodeField'
import { METHOD_DATA } from '../_utils/signup.data'

export const SignupVerify = () => {
	const {
		goBack, stopWait,
		destination, idx, method,
		reply, resend, verify, waiting,
	} = useSignupCtx()

	const { copy } = METHOD_DATA[method.active]

	return (
		<AuthForm
			action={ verify.action }
			idx={ idx }
			pending={ reply.pending }
			state={ reply.state }
			validate={ validateResend }
		>
			<AuthForm.Header eyebrow="Verify" title={ `Check your ${copy.output}s` }>
				We sent a 6-digit code to { destination }. Enter it below.
			</AuthForm.Header>

			<input name="destination" type="hidden" value={ destination } />
			<input name="method" type="hidden" value={ method.active } />

			<CodeField />

			<AuthForm.Footer>
				<AuthForm.Back onClick={ goBack } />

				<AuthForm.Submit label="Verify" loading={ verify.pending } />

				<AuthForm.Note>
					<AuthForm.Resend
						data-intent="resend"
						disabled={ waiting }
						formAction={ resend.action }
						idx={ idx }
						loading={ resend.pending }
						onComplete={ stopWait }
						target="code"
					/>

					<AuthForm.Back
						linkable
						disabled={ reply.pending }
						label={ `Wrong ${copy.input}?` }
						onClick={ goBack }
					/>
				</AuthForm.Note>
			</AuthForm.Footer>
		</AuthForm>
	)
}

SignupVerify.displayName = 'SignupVerify'
