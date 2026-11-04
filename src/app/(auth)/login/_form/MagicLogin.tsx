import { useLoginCtx } from '../_utils/context'
import { writeExpiryText } from '../../_utils/helpers'
import { AuthForm } from '../../_components/AuthForm'
import { SenderField } from '../../_components/SenderField'

export const MagicLogin = () => {
	const {
		content, goBack, guardSubmit,
		destination, idx, magic,
		stopWait, waiting,
	} = useLoginCtx()

	return (
		<AuthForm { ...magic } idx={ idx } onSubmit={ guardSubmit }>
			<AuthForm.Header eyebrow={ content.eyebrow } title={ content.heading }>
				{ content.body ?? writeExpiryText(`If an account exists for ${destination}, a sign-in link is on its way.`) }
			</AuthForm.Header>

			<SenderField email={ destination } idx={ idx } />

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

MagicLogin.displayName = 'MagicLogin'
