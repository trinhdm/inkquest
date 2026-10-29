import { Button } from '@/components/core/Button'
import { Countdown } from '@/components/data/Countdown'
import type { ComponentPropsWithoutRef } from 'react'
import type { AuthFormIDs } from '../_utils/types'

interface ResendTimerProps
	extends Pick<ComponentPropsWithoutRef<'button'>, 'formAction' | 'onClick' | 'name' | 'value'> {
	idx: AuthFormIDs
	loading?: Button.Props['loading']
	onComplete?: Countdown.Props['onComplete']
	waiting: boolean
}

export const ResendTimer = ({
	idx,
	loading,
	onComplete,
	waiting,
	...rest
}: ResendTimerProps) => {
	return (
		<Button
			{ ...rest }
			unstyled data-link
			attributes={ { aria: {
				describedby: waiting ? `${idx.timer}-text` : undefined
			} } }
			className="authentication__resend"
			disabled={ waiting }
			loading={ loading }
			type="submit"
		>
			{ waiting ? 'Resend available in' : 'Resend link' }
			{ waiting && (
				<Countdown
					from={ 30 }
					id={ idx.timer }
					onComplete={ onComplete }
				/>
			) }
		</Button>
	)
}

ResendTimer.displayName = 'ResendTimer'
