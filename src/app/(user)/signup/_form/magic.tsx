import { useSignupCtx } from '../_utils/signup.context'
import { AuthForm } from '../../_components/AuthForm'
import { Field } from '@/components/form/Field'

export const SignupMagic = () => {
	const {
		destination, endWait, goBack,
		idx, method, reply,
		resend, waiting,
		waitUntilExpiry,
	} = useSignupCtx()

	return (
		<AuthForm
			action={ resend.action }
			idx={ idx }
			onSubmit={ waitUntilExpiry }
			pending={ resend.pending }
			state={ reply.state }
		>
			<AuthForm.Header eyebrow="Magic Link" title="Check your inbox">
				We emailed a sign-in link to { destination }. It expires in 15 minutes.
			</AuthForm.Header>

			<input name="destination" type="hidden" value={ destination } />
			<input name="method" type="hidden" value={ method } />

			<Field
				readonly
				id={ `${idx.field}-email` }
				label="Email"
				labelPosition="last"
				layout="inline"
				caption="Didn't arrive? Check spam, or resend below."
			>
				<Field.Input
					defaultValue={ destination }
					name="email"
					type="email"
				/>
			</Field>

			<AuthForm.Footer>
				<AuthForm.Back onClick={ goBack } />

				<AuthForm.Resend
					disabled={ waiting }
					idx={ idx }
					loading={ resend.pending }
					onComplete={ endWait }
				/>
			</AuthForm.Footer>
		</AuthForm>
	)
}

SignupMagic.displayName = 'SignupMagic'
