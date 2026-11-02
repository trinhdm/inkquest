import { useLoginCtx } from '../_utils/login.context'
import { AuthForm } from '../../_components/AuthForm'
import { Field } from '@/components/form/Field'

export const LoginMagic = () => {
	const {
		goBack, guardSubmit, stopWait,
		destination, idx, magic, waiting,
	} = useLoginCtx()

	return (
		<AuthForm { ...magic } idx={ idx } onSubmit={ guardSubmit }>
			<AuthForm.Header eyebrow="Magic Link" title="Check your inbox">
				We emailed a sign-in link to { destination }. It expires in 15 minutes.
			</AuthForm.Header>

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
				<AuthForm.Back disabled={ magic.pending } onClick={ goBack } />

				<AuthForm.Resend
					disabled={ waiting }
					idx={ idx }
					loading={ magic.pending }
					name="resent"
					onComplete={ stopWait }
					value="true"
				/>
			</AuthForm.Footer>
		</AuthForm>
	)
}

LoginMagic.displayName = 'LoginMagic'
