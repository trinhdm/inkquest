import { Avatar } from '@/components/core/Avatar'
import type { ReactNode } from 'react'
import type { AccountValues } from '@/lib/auth/schema'

interface AccountCardProps {
	account: AccountValues | null
	children?: ReactNode
}

export const AccountCard = ({
	account,
	children,
}: AccountCardProps) => {
	if (!account) return null

	return (
		<div className="account">
			<div className="account__info">
				<Avatar ring user={ account } />

				<div className="account__details">
					{ account.name && <strong>{ account.name }</strong> }
					<span>{ account.email }</span>
				</div>
			</div>

			{ children }
		</div>
	)
}

AccountCard.displayName = 'AccountCard'
