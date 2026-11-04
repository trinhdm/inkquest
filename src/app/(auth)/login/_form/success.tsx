import { useLoginCtx } from '../_utils/context'
import { AuthForm } from '../../_components/AuthForm'
import { NavRoutes } from '@/utils/navigation'
import { SenderField } from '../../_components/SenderField'

export const LoginSuccess = () => {
	const {
		content, destination,
		guardSubmit, idx,
	} = useLoginCtx()

	return (
		<AuthForm idx={ idx } onSubmit={ guardSubmit }>
			<AuthForm.Header eyebrow={ content.eyebrow } title={ content.heading }>
				{ content.body }
			</AuthForm.Header>

			<SenderField caption={ null } email={ destination } idx={ idx } />

			<AuthForm.Footer>
				<AuthForm.Continue href={ NavRoutes.COMMUNITY_FEED } label="Go to your feed" />
			</AuthForm.Footer>
		</AuthForm>
	)
}

LoginSuccess.displayName = 'LoginSuccess'
