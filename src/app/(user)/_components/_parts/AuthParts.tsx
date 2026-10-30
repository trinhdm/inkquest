import { Children, Fragment, type ReactNode } from 'react'
import { getChildKey } from '@/lib/component/children'
import { AuthButton } from './AuthButton'
import type { Section } from '@/components/layout/Section'

type OmitAction<T> =
	T extends unknown ? Omit<T, 'action'> : never

type ButtonAuth<K extends AuthButton.Props['action']> =
	OmitAction<Extract<AuthButton.Props, { action: K }>>

type AuthBackProps = ButtonAuth<'back'>
type AuthContinueProps = ButtonAuth<'continue'>
type AuthResendProps = ButtonAuth<'resend'>
type AuthSubmitProps = ButtonAuth<'submit'>

interface AuthHeaderProps {
	children?: ReactNode
	eyebrow?: Section.Props['eyebrow']
	title: NonNullable<Section.Props['title']>
}

interface AuthNoteProps {
	children: ReactNode
}

export const AuthBack = ({ label = 'Back', variant = 'ghost', ...rest }: AuthBackProps) =>
	<AuthButton action="back" label={ label } variant={ variant } { ...rest } />

export const AuthContinue = (props: AuthContinueProps) =>
	<AuthButton action="continue" { ...props } />

export const AuthResend = ({ target = 'link', ...rest }: AuthResendProps) =>
	<AuthButton action="resend" target={ target } { ...rest } />

export const AuthSubmit = (props: AuthSubmitProps) =>
	<AuthButton action="submit" { ...props } />

AuthBack.displayName = 'Button'
AuthContinue.displayName = 'Button'
AuthResend.displayName = 'Button'
AuthSubmit.displayName = 'Button'

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
