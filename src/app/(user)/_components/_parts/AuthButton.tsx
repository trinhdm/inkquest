import { Button } from '@/components/core/Button'
import { Countdown } from '@/components/data/Countdown'
import { Icon } from '@/components/core/Icon'
import { TIMER_DURATION } from '@/lib/form'
import type { Route } from 'next'
import type { AuthFormIDs, AuthSubmitButton } from '../../_utils/types'

const LINKABLE = {
	'data-link': true,
	unstyled: true,
}

type AuthButtonActions =
	| 'back' | 'continue' | 'resend' | 'submit'

interface BaseAuthButtonProps {
	action: AuthButtonActions
	role?: Button.Props['priority']
}

interface NotResendAuth {
	idx?: never
	onComplete?: never
	target?: never
}

interface AuthBackProps
	extends NotResendAuth {
	action: 'back'
	href?: never
	label?: string
	onClick: Button.Props['onClick']
	variant?: Button.Props['variant']
}

interface AuthContinueProps
	extends NotResendAuth {
	action: 'continue'
	href: Route
	label: string
	onClick?: never
	variant?: never
}

interface AuthResendProps {
	action: 'resend'
	href?: never
	idx: AuthFormIDs
	label?: never
	onClick?: never
	onComplete?: Countdown.Props['onComplete']
	target?: 'code' | 'link'
	variant?: never
}

interface AuthSubmitProps
	extends NotResendAuth {
	action: 'submit'
	href?: never
	label: string
	onClick?: Button.Props['onClick']
	variant?: never
}

type AuthButtonChoices =
	| AuthBackProps
	| AuthContinueProps
	| AuthResendProps
	| AuthSubmitProps

type AuthButtonProps =
	& BaseAuthButtonProps
	& AuthSubmitButton
	& AuthButtonChoices

export const AuthButton = ({
	action,
	role = 'primary',
	...rest
}: AuthButtonProps) => {
	if (action === 'resend') {
		const { disabled: waiting, idx, onComplete, target } = rest

		return (
			<Button
				{ ...rest }
				{ ...LINKABLE }
				attributes={ { aria: {
					describedby: waiting ? `${idx!.timer}-text` : undefined
				} } }
				className="authentication__resend"
				disabled={ waiting }
				type="submit"
			>
				{ waiting ? 'Resend available in' : `Resend ${target}` }
				{ waiting && (
					<Countdown
						from={ TIMER_DURATION }
						id={ idx!.timer }
						onComplete={ onComplete }
					/>
				) }
			</Button>
		)
	}

	const { label, ...props } = rest
	const direction = action === 'back' ? 'left' : 'right',
		propsDir = { [`${direction}`]: true }

	if (action === 'submit')
		Object.assign(props, { type: 'submit' })

	if (role === 'primary') {
		return (
			<Button { ...props } animate={ direction }>
				{ label }
				<Button.Section { ...propsDir }><Icon type={ `arrow-${direction}` } /></Button.Section>
			</Button>
		)
	}

	return <Button { ...props } { ...LINKABLE }>{ label }</Button>
}

AuthButton.displayName = 'Button'

export declare namespace AuthButton {
	export type Props = AuthButtonProps
}
