'use client'

import { useLogoutCtx } from '../_utils/context'
import { logout } from '@/lib/auth/actions'
import { AuthForm } from '../../_components/AuthForm'
import { NavRoutes } from '@/utils/navigation'

export const ConfirmLogout = () => {
	const { idx } = useLogoutCtx()

	return (
		<AuthForm action={ logout } idx={ idx }>
			<AuthForm.Header eyebrow="Confirm" title="Log out of Inkquest?">
				You&apos;re still logged in on this browser.
			</AuthForm.Header>

			<AuthForm.Footer>
				<AuthForm.Note>
					<AuthForm.Continue linkable href={ NavRoutes.HOME } label="Back to home" />
				</AuthForm.Note>
			</AuthForm.Footer>
		</AuthForm>
	)
}

ConfirmLogout.displayName = 'ConfirmLogout'
