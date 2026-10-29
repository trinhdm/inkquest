import { useCallback, type MouseEvent } from 'react'
import { Button } from '@/components/core/Button'
import { SSO } from './SSO'

interface SSOGroupProps
	extends Omit<SSO.Props, 'brand'> {}

export const SSOGroup = ({
	disabled,
	loading,
	onClick,
	verb,
}: SSOGroupProps) => {
	const handleClick = useCallback((evt: MouseEvent<HTMLButtonElement>) => {
		if (disabled) {
			evt.preventDefault()
			return
		}

		if (typeof onClick === 'function') onClick(evt)
	}, [disabled, onClick])

	const ssoProps = {
		disabled,
		loading,
		onClick: handleClick,
		verb,
	} satisfies SSOGroupProps

	return (
		<Button.Group
			fullWidth
			className="authentication__sso"
			hasPriority={ false }
		>
			<SSO brand="google" { ...ssoProps } />
			<SSO brand="apple" { ...ssoProps } />
		</Button.Group>
	)
}

SSOGroup.displayName = 'SSOGroup'

export declare namespace SSOGroup {
	export type Props = SSOGroupProps
}
