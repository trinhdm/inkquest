import { Children, Fragment, type ReactNode } from 'react'
import { getChildKey } from '@/lib/component/children'
import { Button } from '@/components/core/Button'
import { Countdown } from '@/components/data/Countdown'
import { Icon } from '@/components/core/Icon'
import { TIMER_DURATION } from '@/lib/form'
import type { Route } from 'next'
import type { AuthFormIDs, AuthSubmitButton } from '@/app/(user)/_utils/types'
import type { Section } from '@/components/layout/Section'

const LINKABLE = {
	'data-link': true,
	unstyled: true,
}

interface AuthBackProps {
	label?: ReactNode
	onClick: Button.Props['onClick']
	role?: Button.Props['priority']
	variant?: Button.Props['variant']
}

interface AuthContinueProps {
	href: Route
	label: ReactNode
}

interface AuthHeaderProps {
	children?: ReactNode
	eyebrow?: Section.Props['eyebrow']
	title: NonNullable<Section.Props['title']>
}

interface AuthNoteProps {
	children: ReactNode
}

interface BaseAuthResendProps {
	idx: AuthFormIDs
	onComplete?: Countdown.Props['onComplete']
	target?: 'code' | 'link'
}

type AuthResendProps =
	& BaseAuthResendProps
	& AuthSubmitButton

interface BaseAuthSubmitProps {
	label: ReactNode
	role?: Button.Props['priority']
}

type AuthSubmitProps =
	& BaseAuthSubmitProps
	& AuthSubmitButton

export const AuthBack = ({
	label = 'Back',
	role = 'primary',
	variant = 'ghost',
	...rest
}: AuthBackProps) => {
	if (role === 'primary') {
		return (
			<Button { ...rest } animate="left" variant={ variant }>
				{ label }
				<Button.Section left><Icon type="arrow-left" /></Button.Section>
			</Button>
		)
	}

	return <Button { ...rest } { ...LINKABLE }>{ label }</Button>
}

AuthBack.displayName = 'Button'

export const AuthContinue = ({
	href,
	label,
}: AuthContinueProps) => {
	return (
		<Button animate="right" href={ href }>
			{ label }
			<Button.Section right><Icon type="arrow-right" /></Button.Section>
		</Button>
	)
}

AuthContinue.displayName = 'Button'

//	AuthForm reads this element's props and never renders it.
//	Its body only runs when someone puts it outside AuthForm.
export const AuthHeader = (_props: AuthHeaderProps) => {
	if (process.env.NODE_ENV !== 'production')
		console.warn('AuthForm: AuthHeader only works as a direct child of AuthForm, so it renders nothing here.')

	return null
}

AuthHeader.displayName = 'AuthHeader'

export const AuthNote = ({ children }: AuthNoteProps) => {
	const items = Children.toArray(children)

	return (
		<div className="authentication__note">
			{ items.map((item, i) => (
				<Fragment key={ getChildKey(item, i) }>
					{ i > 0 && <span data-dot>·</span> }
					{ item }
				</Fragment>
			)) }
		</div>
	)
}

AuthNote.displayName = 'AuthNote'

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

export const AuthSubmit = ({
	label,
	role = 'primary',
	...rest
}: AuthSubmitProps) => {
	if (role === 'primary') {
		return (
			<Button { ...rest } animate="right" type="submit">
				{ label }
				<Button.Section right><Icon type="arrow-right" /></Button.Section>
			</Button>
		)
	}

	return <Button { ...rest } { ...LINKABLE } type="submit">{ label }</Button>
}

AuthSubmit.displayName = 'Button'

export declare namespace AuthBack {
	export type Props = AuthBackProps
}

export declare namespace AuthContinue {
	export type Props = AuthContinueProps
}

export declare namespace AuthHeader {
	export type Props = AuthHeaderProps
}

export declare namespace AuthNote {
	export type Props = AuthNoteProps
}

export declare namespace AuthResend {
	export type Props = AuthResendProps
}

export declare namespace AuthSubmit {
	export type Props = AuthSubmitProps
}
