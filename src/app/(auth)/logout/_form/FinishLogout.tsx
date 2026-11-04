'use client'

import { useLogoutCtx } from '../_utils/context'
import { getFirstName } from '../../_utils/helpers'
import { switchAccount, transferAccount } from '../_utils/actions'
import { AuthForm } from '../../_components/AuthForm'
import { Avatar } from '@/components/core/Avatar'
import { NavRoutes } from '@/utils/navigation'

export const FinishLogout = () => {
	const { account, idx  } = useLogoutCtx()
	const firstName = account && getFirstName(account)

	return (
		<AuthForm action={ transferAccount } idx={ idx }>
			<AuthForm.Header eyebrow="Logged out" title="You're signed out.">
				Your account is safe. Log back in whenever you&apos;re ready.
			</AuthForm.Header>

			<div className="account">
				<div className="account__info">
					<Avatar user={ account } />
					<div className="account__details">
						{ account.name && <strong>{ account.name }</strong> }
						<span>{ account.email }</span>
					</div>
				</div>

				<AuthForm.Submit
					fullWidth
					label={ firstName ? `Continue as ${firstName}` : 'Continue' }
				/>
			</div>

			<AuthForm.Footer>
				<AuthForm.Alternate
					as="auth"
					data-intent="switch"
					formAction={ switchAccount }
				/>

				<AuthForm.Note>
					<AuthForm.Continue linkable href={ NavRoutes.HOME } label="Back to home" />
				</AuthForm.Note>
			</AuthForm.Footer>
		</AuthForm>
	)
}

FinishLogout.displayName = 'FinishLogout'
