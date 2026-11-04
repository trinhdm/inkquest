import { useSignupCtx } from '../_utils/context'
import { writeExpiryText } from '../../_utils/helpers'
import { AuthForm } from '../../_components/AuthForm'
import { HiddenFields } from '../_components/HiddenFields'
import { SenderField } from '../../_components/SenderField'

export const CheckSignup = () => {
	const {
		content, destination, goBack,
		guardSubmit, idx, reply,
		resend, stopWait, waiting,
	} = useSignupCtx()

	return (
		<AuthForm
			action={ resend.action }
			idx={ idx }
			onSubmit={ guardSubmit }
			pending={ resend.pending }
			state={ reply.state }
		>
			<AuthForm.Header eyebrow={ content.eyebrow } title={ content.heading }>
				{ content.body ?? writeExpiryText(`We emailed a sign-in link to ${destination}.`) }
			</AuthForm.Header>

			<HiddenFields contact destination method />
			<SenderField email={ destination } idx={ idx } />

			<AuthForm.Footer>
				<AuthForm.Back disabled={ resend.pending } onClick={ goBack } />

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

CheckSignup.displayName = 'CheckSignup'
