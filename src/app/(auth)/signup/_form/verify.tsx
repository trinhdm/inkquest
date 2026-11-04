import { useSignupCtx } from '../_utils/context'
import { validateVerifyForm } from '../_utils/schema'
import { AuthForm } from '../../_components/AuthForm'
import { CodeField } from '../_components/CodeField'
import { HiddenFields } from '../_components/HiddenFields'
import { CODE_LENGTH, METHOD_DATA } from '../_utils/data'

export const SignupVerify = () => {
	const {
		content, destination, goBack, idx,
		method: { active: method },
		reply, resend, stopWait,
		verify, waiting,
	} = useSignupCtx()

	const { copy } = METHOD_DATA[method]

	return (
		<AuthForm
			action={ verify.action }
			idx={ idx }
			pending={ reply.pending }
			state={ reply.state }
			validate={ validateVerifyForm }
		>
			<AuthForm.Header eyebrow={ content.eyebrow } title={ `Check your ${copy.output}` }>
				{ content.body ?? <>We sent a { CODE_LENGTH }-digit code to { destination }. Enter it below.</> }
			</AuthForm.Header>

			<HiddenFields contact method />
			<CodeField />

			<AuthForm.Footer>
				<AuthForm.Back disabled={ reply.pending } onClick={ goBack } />
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
