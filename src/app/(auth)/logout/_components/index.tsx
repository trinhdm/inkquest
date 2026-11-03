'use client'

import Link from 'next/link'
import { getAuthFormIDs, getFirstName, getInitials } from '../../_utils/helpers'
import { switchAccount } from '../_utils/actions'
import { AuthForm } from '../../_components/AuthForm'
import type { RememberedAccount } from '../../_utils/account'

const IDX = getAuthFormIDs('logout', 'done')

interface LogoutBaseProps {
	account: RememberedAccount | null
}

export const LogoutBase = ({ account }: LogoutBaseProps) => {
	const firstName = account && getFirstName(account)

	return (
		<AuthForm action={ switchAccount } idx={ IDX }>
			<AuthForm.Header eyebrow="Logged out" title="You're signed out.">
				Your account is safe. Log back in whenever you&apos;re ready.
			</AuthForm.Header>

			{ !!account && (
				<>
					<div className="authentication__account">
						<div className="authentication__info">
							<span aria-hidden="true" className="authentication__initials">
								{ getInitials(account) }
							</span>
							<div className="authentication__details">
								{ account.name && <strong>{ account.name }</strong> }
								<span>{ account.email }</span>
							</div>
						</div>

						<AuthForm.Continue
							fullWidth
							href="/login"
							label={ firstName ? `Continue as ${firstName}` : 'Continue' }
						/>
					</div>
				</>
			) }

			<AuthForm.Footer>
				<AuthForm.Alternate as="auth" hasDivider={ !!account } />

				<AuthForm.Note>
					<p><Link href="/" data-link>Back to home</Link></p>
				</AuthForm.Note>
			</AuthForm.Footer>
		</AuthForm>
	)
}

LogoutBase.displayName = 'LogoutBase'
