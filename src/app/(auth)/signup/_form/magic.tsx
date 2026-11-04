import { useSignupCtx } from '../_utils/signup.context'
import { AuthForm } from '../../_components/AuthForm'
import { Field } from '@/components/form/Field'

export const SignupMagic = () => {
	const {
		destination, goBack, guardSubmit, idx,
		method: { active: method },
		reply, resend, stopWait, waiting,
	} = useSignupCtx()

	return (
		<AuthForm
			action={ resend.action }
			idx={ idx }
			onSubmit={ guardSubmit }
			pending={ resend.pending }
			state={ reply.state }
		>
			<AuthForm.Header eyebrow="Magic Link" title="Check your inbox">
				We emailed a sign-in link to { destination }. It expires in 15 minutes.
			</AuthForm.Header>

			<Field.Hidden name="destination" value={ destination } />
			<Field.Hidden name="method" value={ method } />

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
					onComplete={ stopWait }
				/>
			</AuthForm.Footer>
		</AuthForm>
	)
}

SignupMagic.displayName = 'SignupMagic'
