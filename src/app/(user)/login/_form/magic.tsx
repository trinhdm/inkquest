import { useLoginCtx } from '../_utils/login.context'
import { AuthForm } from '../../_components/AuthForm'
import { Field } from '@/components/form/Field'

export const LoginMagic = () => {
	const {
		destination, endWait,
		handleLoginFlow, idx,
		magic, waiting,
		waitUntilExpiry,
	} = useLoginCtx()

	return (
		<AuthForm { ...magic } idx={ idx } onSubmit={ waitUntilExpiry }>
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
				<AuthForm.Back onClick={ () => handleLoginFlow('begin') } />

				<AuthForm.Resend
					idx={ idx }
					loading={ magic.pending }
					name="resent"
					onComplete={ endWait }
					value="true"
					waiting={ waiting }
				/>
			</AuthForm.Footer>
		</AuthForm>
	)
}

LoginMagic.displayName = 'LoginMagic'
