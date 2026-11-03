import { Children, Fragment, type ReactNode } from 'react'
import { getChildKey } from '@/lib/component/children'
import { Button } from '@/components/core/Button'
import { Countdown } from '@/components/data/Countdown'
import { LINKABLE } from '@/utils/constants'
import { TIMER_DURATION } from '@/lib/form'
import type { AuthFormIDs, AuthSubmitButton } from '../../_utils/types'
import type { Section } from '@/components/layout/Section'

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

//	header

//	for AuthForm to read component's props without rendering
export const AuthHeader = (_props: AuthHeaderProps) => {
	if (process.env.NODE_ENV !== 'production')
		console.warn('AuthForm: AuthHeader only works as a direct child of AuthForm, so it renders nothing here.')

	return null
}

AuthHeader.displayName = 'AuthHeader'

//	note

export const AuthNote = ({ children }: AuthNoteProps) => {
	const items = Children.toArray(children)

	return (
		<div className="authentication__note">
			{ items.map((item, i) => (
				<Fragment key={ getChildKey(item, i) }>
					{ i > 0 && <span aria-hidden data-dot>·</span> }
					{ item }
				</Fragment>
			)) }
		</div>
	)
}

AuthNote.displayName = 'AuthNote'

//	resend

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

export declare namespace AuthHeader {
	export type Props = AuthHeaderProps
}

export declare namespace AuthNote {
	export type Props = AuthNoteProps
}

export declare namespace AuthResend {
	export type Props = AuthResendProps
}
