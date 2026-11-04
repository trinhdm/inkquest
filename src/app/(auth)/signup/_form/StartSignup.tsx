import { useParser } from '@/hooks/useParser'
import { useSignupCtx } from '../_utils/context'
import { validateSignup } from '../_utils/schema'
import { AuthForm } from '../../_components/AuthForm'
import { ContactField } from '../_components/ContactField'
import { HiddenFields } from '../_components/HiddenFields'
import { PasswordField } from '../_components/PasswordField'
import { METHOD_DATA } from '../_utils/data'

export const StartSignup = () => {
	const {
		content, idx, navigate,
		method: { active: method },
		signup: { action, pending, state },
	} = useSignupCtx()

	const note = useParser(content.footer)
	const { verify: { submit } } = METHOD_DATA[method]

	return (
		<AuthForm
			action={ action }
			feedback="eager"
			idx={ idx }
			pending={ pending }
			state={ state }
			validate={ validateSignup }
		>
			<AuthForm.Header eyebrow={ content.eyebrow } title={ content.heading }>
				{ content.body }
			</AuthForm.Header>

			<HiddenFields method />

			<ContactField />
			<PasswordField />

			<AuthForm.Footer>
				<AuthForm.Submit
					fullWidth
					label={ submit }
					loading={ pending }
				/>

				<AuthForm.Alternate
					as="SSO"
					disabled={ pending }
					label="continue"
					onClick={ () => navigate('finish') }
				/>

				{ !!note && (
					<AuthForm.Note>
						<p>{ note }</p>
					</AuthForm.Note>
				) }
			</AuthForm.Footer>
		</AuthForm>
	)
}

StartSignup.displayName = 'StartSignup'
