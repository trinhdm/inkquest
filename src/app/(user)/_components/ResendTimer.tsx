import { Button } from '@/components/core/Button'
import { Countdown } from '@/components/data/Countdown'
import { TIMER_DURATION } from '@/lib/form'
import type { ComponentPropsWithoutRef } from 'react'
import type { AuthFormIDs } from '../_utils/types'

interface ResendTimerProps
	extends Pick<ComponentPropsWithoutRef<'button'>, 'formAction' | 'onClick' | 'name' | 'value'> {
	idx: AuthFormIDs
	loading?: Button.Props['loading']
	noun?: 'code' | 'link'
	onComplete?: Countdown.Props['onComplete']
	waiting: boolean
}

export const ResendTimer = ({
	idx,
	loading,
	noun = 'link',
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
			{ waiting ? 'Resend available in' : `Resend ${noun}` }
			{ waiting && (
				<Countdown
					from={ TIMER_DURATION }
					id={ idx.timer }
					onComplete={ onComplete }
				/>
			) }
		</Button>
	)
}

ResendTimer.displayName = 'Button'
