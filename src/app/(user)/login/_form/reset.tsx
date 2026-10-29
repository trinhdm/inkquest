import { useLoginCtx } from '../_utils/login.context'
import { AuthForm } from '../../_components/AuthForm'
import { Button } from '@/components/core/Button'
import { Field } from '@/components/form/Field'

export const LoginReset = () => {
	const {
		destination, endWait,
		handleLoginFlow, idx,
		reset, waiting,
		waitUntilExpiry,
	} = useLoginCtx()

	return (
		<AuthForm { ...reset } idx={ idx } onSubmit={ waitUntilExpiry }>
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
					onClick={ () => handleLoginFlow('begin') }
					variant="solid"
				>
					Back to log in
				</AuthForm.Back>

				<AuthForm.Note>
					<AuthForm.Resend
						idx={ idx }
						loading={ reset.pending }
						name="resent"
						onComplete={ endWait }
						value="true"
						waiting={ waiting }
					/>

					<Button
						unstyled data-link
						onClick={ () => handleLoginFlow('forgot') }
					>
						Wrong email?
					</Button>
				</AuthForm.Note>
			</AuthForm.Footer>
		</AuthForm>
	)
}

LoginReset.displayName = 'LoginReset'
