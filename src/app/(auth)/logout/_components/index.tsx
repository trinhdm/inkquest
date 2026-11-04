'use client'

import Link from 'next/link'
import { getFirstName } from '../../_utils/helpers'
import { suggestAccount, switchAccount } from '../_utils/actions'
import { AuthForm } from '../../_components/AuthForm'
import { Avatar } from '@/components/core/Avatar'
import { NavRoutes } from '@/utils/navigation'
import { IDX } from '../_utils/data'
import type { AccountValues } from '@/lib/auth/schema'

interface LogoutBaseProps {
	account: AccountValues | null
}

export const LogoutBase = ({ account }: LogoutBaseProps) => {
	const firstName = account && getFirstName(account)

	return (
		<AuthForm action={ suggestAccount } idx={ IDX }>
			<AuthForm.Header eyebrow="Logged out" title="You're signed out.">
				Your account is safe. Log back in whenever you&apos;re ready.
			</AuthForm.Header>

			{ !!account && (
				<>
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
				</>
			) }

			<AuthForm.Footer>
				<AuthForm.Alternate
					as="auth"
					data-intent="switch"
					formAction={ switchAccount }
					hasDivider={ !!account }
				/>

				<AuthForm.Note>
					<p><Link href={ NavRoutes.HOME } data-link>Back to home</Link></p>
				</AuthForm.Note>
			</AuthForm.Footer>
		</AuthForm>
	)
}

LogoutBase.displayName = 'LogoutBase'
