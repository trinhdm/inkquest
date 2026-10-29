import { Button } from '@/components/core/Button'
import { Icon } from '@/components/core/Icon'
import { SSOGroup } from './SSO'
import type { ComponentPropsWithoutRef } from 'react'

type AuthSubmitArgs =
	& Pick<Button.Props, 'disabled' | 'loading' | 'onClick'>
	& Pick<ComponentPropsWithoutRef<'button'>, 'formAction' | 'name' | 'value'>
	& { label: string }

interface AuthFooterProps {
	button: AuthSubmitArgs
	children: Button.Props['children']
	sso: SSOGroup.Props
}

export const AuthFooter = ({
	button,
	children,
	sso,
}: AuthFooterProps) => {
	const { label, ...buttonProps } = button

	return (
		<div className="form__ctas authentication">
			<Button
				{ ...buttonProps }
				fullWidth
				animate="right"
				className="authentication__email"
				type="submit"
			>
				{ label }
				<Button.Section right><Icon type="arrow-right" /></Button.Section>
			</Button>

			<div className="authentication__label" role="presentation">
				<span>or</span>
			</div>

			<SSOGroup { ...sso } />

			<div className="authentication__note">
				{ children }
			</div>
		</div>
	)

	// return (
	// 	<>
	// 		<Button
	// 			animate="left"
	// 			onClick={ () => handleLoginFlow('email') }
	// 		>
	// 			Back to log in
	// 			<Button.Section left><Icon type="arrow-left" /></Button.Section>
	// 		</Button>

	// 		<div className="authentication__note">
	// 			<Button
	// 				unstyled data-link
	// 				attributes={ { aria: {
	// 					describedby: waiting ? `${idx.timer}-text` : undefined
	// 				} } }
	// 				className="authentication__resend"
	// 				disabled={ waiting }
	// 				loading={ pending }
	// 				type="submit"
	// 			>
	// 				{ waiting ? 'Resend available in' : 'Resend link' }
	// 				{ waiting && (
	// 					<Countdown
	// 						from={ 30 }
	// 						id={ idx.timer }
	// 						onComplete={ endWait }
	// 					/>
	// 				) }
	// 			</Button>

	// 			<span data-dot>·</span>

	// 			<Button
	// 				unstyled data-link
	// 				onClick={ () => handleLoginFlow('forgot') }
	// 			>
	// 				Wrong email?
	// 			</Button>
	// 		</div>
	// 	</>
	// )
}

AuthFooter.displayName = 'AuthFooter'

export declare namespace AuthFooter {
	export type Props = AuthFooterProps
}
