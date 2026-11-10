import { Children, Fragment, type ReactNode } from 'react'
import { getChildKey } from '@/lib/component/children'
import type { Section } from '@/components/layout/Section'

interface AuthHeaderProps {
	children?: ReactNode
	eyebrow?: Section.Props['eyebrow']
	title: NonNullable<Section.Props['title']>
}

//	header

//	for AuthForm to read component's props without rendering
export const AuthHeader = (_props: AuthHeaderProps) => {
	if (process.env.NODE_ENV !== 'production')
		console.warn('AuthForm: AuthHeader only works as a direct child of AuthForm, so it renders nothing here.')

	return null
}

AuthHeader.displayName = 'AuthHeader'

//	note

interface AuthNoteProps {
	children: ReactNode
}

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

export declare namespace AuthHeader {
	export type Props = AuthHeaderProps
}

export declare namespace AuthNote {
	export type Props = AuthNoteProps
}
