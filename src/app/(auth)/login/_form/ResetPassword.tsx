import { useLoginCtx } from '../_utils/context'
import { AuthForm } from '../../_components/AuthForm'
import { SenderField } from '../../_components/SenderField'
import { writeExpiryText } from '../../_utils/helpers'

export const ResetPassword = () => {
	const {
		content, destination, goBack,
		guardSubmit, idx, reset,
		restart, stopWait, waiting,
	} = useLoginCtx()

	return (
		<AuthForm { ...reset } idx={ idx } onSubmit={ guardSubmit }>
			<AuthForm.Header eyebrow={ content.eyebrow } title={ content.heading }>
				{ content.body ?? writeExpiryText(`If an account exists for ${destination}, a link to reset your password is on its way.`, 1800) }
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

ResetPassword.displayName = 'ResetPassword'
