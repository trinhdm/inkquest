'use client'

import { useLogoutCtx } from '../_utils/context'
import { logout } from '@/lib/auth/actions'
import { AccountCard } from '../../_components/AccountCard'
import { AuthForm } from '../../_components/AuthForm'
import { SHARED_CONTINUE_PROPS } from '../_utils/data'

export const ConfirmLogout = () => {
	const { account, content, idx } = useLogoutCtx()

	return (
		<AuthForm action={ logout } idx={ idx }>
			<AuthForm.Header eyebrow={ content.eyebrow } title={ content.heading }>
				{ content.body }
			</AuthForm.Header>

			<AccountCard account={ account }>
				<AuthForm.Submit fullWidth label="Log out" />
			</AccountCard>

			<AuthForm.Footer>
				<AuthForm.Note>
					<AuthForm.Continue { ...SHARED_CONTINUE_PROPS } />
				</AuthForm.Note>
			</AuthForm.Footer>
		</AuthForm>
	)
}

ConfirmLogout.displayName = 'ConfirmLogout'
