import { Button } from '@/components/core/Button'
import { Countdown } from '@/components/data/Countdown'
import { LINKABLE } from '@/utils/constants'
import { TIMER_DURATION } from '@/lib/form'
import type { AuthFormIDs, AuthSubmitButton } from '../../_utils/types'

interface BaseAuthResendProps {
	idx: AuthFormIDs
	onComplete?: Countdown.Props['onComplete']
	target?: 'code' | 'link'
}

type AuthResendProps =
	& BaseAuthResendProps
	& AuthSubmitButton

//	resend

export const AuthResend = ({
	idx,
	onComplete,
	target = 'link',
	...rest
}: AuthResendProps) => {
	const { disabled: waiting } = rest

	return (
		<Button
			{ ...rest }
			{ ...LINKABLE }
			attributes={ { aria: {
				describedby: waiting ? `${idx.timer}-text` : undefined
			} } }
			className="authentication__resend"
			disabled={ waiting }
			type="submit"
		>
			{ waiting ? 'Resend available in' : `Resend ${target}` }
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

AuthResend.displayName = 'Button'

export declare namespace AuthResend {
	export type Props = AuthResendProps
}
