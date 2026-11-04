'use client'

import { useLogoutCtx } from '../_utils/context'
import { getFirstName } from '../../_utils/helpers'
import { switchAccount, transferAccount } from '../_utils/actions'
import { AccountCard } from '../../_components/AccountCard'
import { AuthForm } from '../../_components/AuthForm'
import { SHARED_CONTINUE_PROPS } from '../_utils/data'

export const FinishLogout = () => {
	const { account, content, idx } = useLogoutCtx()
	const firstName = account && getFirstName(account)

	return (
		<AuthForm action={ transferAccount } idx={ idx }>
			<AuthForm.Header eyebrow={ content.eyebrow } title={ content.heading }>
				{ content.body }
			</AuthForm.Header>

			<AccountCard account={ account }>
				<AuthForm.Submit
					fullWidth
					label={ firstName ? `Continue as ${firstName}` : 'Continue' }
				/>
			</AccountCard>

			<AuthForm.Footer>
				<AuthForm.Alternate
					as="auth"
					data-intent="switch"
					formAction={ switchAccount }
				/>

				<AuthForm.Note>
					<AuthForm.Continue { ...SHARED_CONTINUE_PROPS } />
				</AuthForm.Note>
			</AuthForm.Footer>
		</AuthForm>
	)
}

FinishLogout.displayName = 'FinishLogout'
