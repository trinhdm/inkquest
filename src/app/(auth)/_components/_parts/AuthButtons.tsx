import { Button } from '@/components/core/Button'
import { Icon } from '@/components/core/Icon'
import { LINKABLE } from '@/utils/constants'
import type { ReactNode } from 'react'
import type { Route } from 'next'
import type { AuthSubmitButton, RootActionButton } from '../../_utils/types'

const ARROW_SIDE = {
	left: { left: true },
	right: { right: true },
} as const

interface BaseAuthButtonProps {
	children: ReactNode
	direction: keyof typeof ARROW_SIDE
	href?: Route
	linkable?: boolean
	type?: 'submit'
	variant?: Button.Props['variant']
}

type AuthButtonProps =
	& BaseAuthButtonProps
	& AuthSubmitButton

interface BaseAuthBackProps {
	label?: string
	linkable?: boolean
	onClick: Button.Props['onClick']
	variant?: Button.Props['variant']
}

type AuthBackProps =
	& BaseAuthBackProps
	& Pick<RootActionButton, 'disabled' | 'loading'>

interface AuthContinueProps {
	href: Route
	label: string
}

interface BaseAuthSubmitProps {
	label: string
	linkable?: boolean
}

type AuthSubmitProps =
	& BaseAuthSubmitProps
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

export const AuthBack = ({
	label = 'Back',
	variant = 'ghost',
	...rest
}: AuthBackProps) =>
	<AuthButton { ...rest } direction="left" variant={ variant }>{ label }</AuthButton>

AuthBack.displayName = 'Button'

export const AuthContinue = ({ href, label }: AuthContinueProps) =>
	<AuthButton direction="right" href={ href }>{ label }</AuthButton>

AuthContinue.displayName = 'Button'

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
