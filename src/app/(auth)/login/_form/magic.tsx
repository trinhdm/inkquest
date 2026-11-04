import { useLoginCtx } from '../_utils/context'
import { writeMagicIntro } from '../../_utils/helpers'
import { AuthForm } from '../../_components/AuthForm'
import { SenderField } from '../../_components/SenderField'

export const LoginMagic = () => {
	const {
		goBack, guardSubmit, stopWait,
		destination, idx, magic, waiting,
	} = useLoginCtx()

	return (
		<AuthForm { ...magic } idx={ idx } onSubmit={ guardSubmit }>
			<AuthForm.Header eyebrow="Magic Link" title="Check your inbox">
				{ writeMagicIntro(destination) }
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

LoginMagic.displayName = 'LoginMagic'
