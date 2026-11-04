import { Button } from '@/components/core/Button'
import { Icon } from '@/components/core/Icon'
import { LINKABLE } from '@/utils/constants'
import type { AuthSubmitButton, NativeButtonProps } from '../../_utils/types'

const ARROW_SIDE = {
	left: { left: true },
	right: { right: true },
} as const

interface BaseAuthButtonProps {
	children: Button.Props['children']
	direction: keyof typeof ARROW_SIDE
	href?: Button.Props['href']
	linkable?: boolean
	type?: Extract<NativeButtonProps['type'], 'submit'>
	variant?: Button.Props['variant']
}

type AuthButtonProps =
	& BaseAuthButtonProps
	& AuthSubmitButton

const AuthButton = ({
	children,
	direction,
	linkable,
	...rest
}: AuthButtonProps) => {
	if (linkable) return <Button { ...rest } { ...LINKABLE }>{ children }</Button>

	return (
		<Button { ...rest } animate={ direction }>
			{ children }
			<Button.Section { ...ARROW_SIDE[direction] }>
				<Icon type={ `arrow-${direction}` } />
			</Button.Section>
		</Button>
	)
}

//	variations

interface AuthBackProps {
	disabled?: Button.Props['disabled']
	label?: string
	linkable?: AuthButtonProps['linkable']
	loading?: Button.Props['loading']
	onClick: Button.Props['onClick']
	variant?: Button.Props['variant']
}

export const AuthBack = ({
	label = 'Back',
	variant = 'ghost',
	...rest
}: AuthBackProps) =>
	<AuthButton { ...rest } direction="left" variant={ variant }>{ label }</AuthButton>

AuthBack.displayName = 'Button'

interface AuthContinueProps {
	fullWidth?: Button.Props['fullWidth']
	href: Button.Props['href']
	label: string
}

export const AuthContinue = ({
	href,
	label,
	...rest
}: AuthContinueProps) =>
	<AuthButton { ...rest } direction="right" href={ href }>{ label }</AuthButton>

AuthContinue.displayName = 'Button'

interface BaseAuthSubmitProps {
	label: string
	linkable?: AuthButtonProps['linkable']
}

type AuthSubmitProps =
	& BaseAuthSubmitProps
	& AuthSubmitButton

export const AuthSubmit = ({ label, ...rest }: AuthSubmitProps) =>
	<AuthButton { ...rest } direction="right" type="submit">{ label }</AuthButton>

AuthSubmit.displayName = 'Button'

export declare namespace AuthBack {
	export type Props = AuthBackProps
}

export declare namespace AuthContinue {
	export type Props = AuthContinueProps
}

export declare namespace AuthSubmit {
	export type Props = AuthSubmitProps
}
