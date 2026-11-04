import { useLoginCtx } from '../_utils/context'
import { AuthForm } from '../../_components/AuthForm'
import { SenderField } from '../../_components/SenderField'

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

			<SenderField email={ destination } idx={ idx } />

			<AuthForm.Footer>
				<AuthForm.Back
					disabled={ reset.pending }
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
						disabled={ reset.pending }
						label="Wrong email?"
						onClick={ goBack }
					/>
				</AuthForm.Note>
			</AuthForm.Footer>
		</AuthForm>
	)
}

LoginReset.displayName = 'LoginReset'
