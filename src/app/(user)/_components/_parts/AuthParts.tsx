import { Children, Fragment, type ComponentPropsWithoutRef, type ReactNode } from 'react'
import { getChildKey } from '@/lib/component/children'
import { Button } from '@/components/core/Button'
import { Countdown } from '@/components/data/Countdown'
import { Icon } from '@/components/core/Icon'
import { TIMER_DURATION } from '@/lib/form'
import type { Route } from 'next'
import type { AuthFormIDs } from '@/app/(user)/_utils/types'
import type { Section } from '@/components/layout/Section'

interface AuthBackProps
	extends Pick<Button.Props, 'onClick' | 'variant'> {
	children?: ReactNode
}

interface AuthContinueProps
	extends Pick<Button.Props, 'children'> {
	href: Route
}

interface AuthHeaderProps {
	children?: ReactNode
	eyebrow?: Section.Props['eyebrow']
	title: NonNullable<Section.Props['title']>
}

interface AuthNoteProps {
	children: ReactNode
}

interface AuthResendProps
	extends Pick<ComponentPropsWithoutRef<'button'>, 'formAction' | 'onClick' | 'name' | 'value'> {
	idx: AuthFormIDs
	loading?: Button.Props['loading']
	noun?: 'code' | 'link'
	onComplete?: Countdown.Props['onComplete']
	waiting: boolean
}

type AuthSubmitProps =
	& Pick<Button.Props, 'children' | 'disabled' | 'fullWidth' | 'loading'>
	& Pick<ComponentPropsWithoutRef<'button'>, 'formAction' | 'name' | 'value'>

export const AuthBack = ({
	children = 'Back',
	variant = 'ghost',
	...rest
}: AuthBackProps) => {
	return (
		<Button { ...rest } animate="left" variant={ variant }>
			{ children }
			<Button.Section left><Icon type="arrow-left" /></Button.Section>
		</Button>
	)
}

//	Button.Group keeps only children named 'Button', so the action parts share that name.
//	That is why AuthFooter matches parts by component (child.type), never by displayName.
AuthBack.displayName = 'Button'

export const AuthContinue = ({
	children,
	href,
}: AuthContinueProps) => {
	return (
		<Button animate="right" href={ href }>
			{ children }
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
	loading,
	noun = 'link',
	onComplete,
	waiting,
	...rest
}: AuthResendProps) => {
	return (
		<Button
			{ ...rest }
			unstyled data-link
			attributes={ { aria: {
				describedby: waiting ? `${idx.timer}-text` : undefined
			} } }
			className="authentication__resend"
			disabled={ waiting }
			loading={ loading }
			type="submit"
		>
			{ waiting ? 'Resend available in' : `Resend ${noun}` }
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
	children,
	...rest
}: AuthSubmitProps) => {
	return (
		<Button { ...rest } animate="right" type="submit">
			{ children }
			<Button.Section right><Icon type="arrow-right" /></Button.Section>
		</Button>
	)
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
