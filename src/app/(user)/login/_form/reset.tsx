import { useLoginCtx } from '../_utils/login.context'
import { AuthForm } from '../../_components/AuthForm'
import { Field } from '@/components/form/Field'

export const LoginReset = () => {
	const {
		goBack, guardSubmit,
		restart, stopWait,
		destination, idx,
		reset, waiting,
	} = useLoginCtx()

	return (
		<AuthForm { ...reset } idx={ idx } onSubmit={ guardSubmit }>
			<AuthForm.Header eyebrow="Check your inbox" title="Reset link sent">
				If an account exists for { destination }, a link to reset your password is on its way. It expires in 30 minutes.
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
				<AuthForm.Back
					label="Back to log in"
					onClick={ restart }
					variant="solid"
				/>

				<AuthForm.Note>
					<AuthForm.Resend
						disabled={ waiting }
						idx={ idx }
						loading={ reset.pending }
						name="resent"
						onComplete={ stopWait }
						value="true"
					/>

					<AuthForm.Back
						linkable
						label="Wrong email?"
						onClick={ goBack }
					/>
				</AuthForm.Note>
			</AuthForm.Footer>
		</AuthForm>
	)
}

LoginReset.displayName = 'LoginReset'
