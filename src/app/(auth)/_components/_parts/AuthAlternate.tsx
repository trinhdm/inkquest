import { capitalize, keyHasValue } from '@/utils/helpers'
import { Button } from '@/components/core/Button'
import { Icon } from '@/components/core/Icon'
import { NavRoutes } from '@/utils/navigation'
import type { ReactNode } from 'react'
import type { AuthSubmitButton, RootActionButton } from '../../_utils/types'

const SHARED_ALT = {
	fullWidth: true,
	variant: 'outline',
} satisfies Omit<Button.Props, 'children'>

//	divider

interface AuthDividerProps {
	text?: ReactNode
}

const AuthDivider = ({ text = 'or' }: AuthDividerProps) => (
	<div className="authentication__divider" role="presentation">
		<span>{ text }</span>
	</div>
)

//	SSO alternative

interface ButtonSSOProps
	extends Omit<RootActionButton, 'fullWidth'> {
	brand: Icon.Social.Props['type']
	label: string
}

const ButtonSSO = ({
	brand,
	label,
	...props
}: ButtonSSOProps) => {
	const action = capitalize(label),
		name = capitalize(brand)

	return (
		<Button { ...props } { ...SHARED_ALT }>
			<Button.Section><Icon type={ brand } /></Button.Section>
			{ action } with { name }
		</Button>
	)
}

//	alternate

interface AuthAlternateBase {
	hasDivider?: boolean
}

interface AuthDefaultBase {
	as: 'auth'
	label?: never
	onClick?: never
}

type AuthDefaultProps =
	& Omit<AuthSubmitButton, 'fullWidth' | 'onClick'>
	& AuthDefaultBase

interface AuthSSOBase {
	as: 'SSO'
	'data-intent'?: never
	formAction?: never
	name?: never
	value?: never
}

type AuthSSOProps =
	& Omit<ButtonSSOProps, 'brand'>
	& AuthSSOBase

type AuthAlternateChoices =
	| AuthDefaultProps
	| AuthSSOProps

type AuthAlternateProps =
	& AuthAlternateBase
	& AuthAlternateChoices

const AuthAlternatives = (props: AuthAlternateChoices) => {
	if (keyHasValue(props, { as: 'SSO' })) {
		const { as, ...rest } = props

		return (
			<>
				<ButtonSSO { ...rest } brand="google" />
				<ButtonSSO { ...rest } brand="apple" />
			</>
		)
	}

	const {
		as, formAction,
		'data-intent': intent,
		...rest }
		 = props
	const others = { ...rest, ...SHARED_ALT }

	return (
		<>
			<Button
				{ ...others }
				data-intent={ intent }
				formAction={ formAction }
				type="submit"
			>
				Use a different account
			</Button>
			<Button { ...others } href={ NavRoutes.AUTH_SIGNUP }>
				Create an account
			</Button>
		</>
	)
}

AuthAlternatives.displayName = 'Button'

export const AuthAlternate = ({
	hasDivider = true,
	...rest
}: AuthAlternateProps) => (
	<>
		{ hasDivider && <AuthDivider /> }

		<Button.Group fullWidth hasPriority={ false }>
			<AuthAlternatives { ...rest } />
		</Button.Group>
	</>
)

AuthAlternate.displayName = 'AuthAlternate'

export declare namespace AuthAlternate {
	export type Props = AuthAlternateProps
}
