import { capitalize } from '@/utils/helpers'
import { Button } from '@/components/core/Button'
import { Icon } from '@/components/core/Icon'

interface AuthSSOProps
	extends Omit<ButtonSSOProps, 'brand'> {
	hasDivider?: boolean
}

interface ButtonSSOProps
	extends Pick<Button.Props, 'disabled' | 'loading' | 'onClick'> {
	brand: Icon.Social.Props['type']
	label: string
}

export const ButtonSSO = ({
	brand,
	label,
	...props
}: ButtonSSOProps) => {
	const action = capitalize(label),
		name = capitalize(brand)

	return (
		<Button
			{ ...props }
			fullWidth
			variant="outline"
		>
			<Button.Section><Icon type={ brand } /></Button.Section>
			{ action } with { name }
		</Button>
	)
}

ButtonSSO.displayName = 'Button'

export const AuthSSO = ({
	hasDivider = true,
	...props
}: AuthSSOProps) => {
	return (
		<>
			{ hasDivider && (
				<div className="authentication__label" role="presentation">
					<span>or</span>
				</div>
			) }

			<Button.Group
				fullWidth
				className="authentication__sso"
				hasPriority={ false }
			>
				<ButtonSSO { ...props } brand="google" />
				<ButtonSSO { ...props } brand="apple" />
			</Button.Group>
		</>
	)
}

AuthSSO.displayName = 'AuthSSO'

export declare namespace AuthSSO {
	export type Props = AuthSSOProps
}

export declare namespace ButtonSSO {
	export type Props = ButtonSSOProps
}
