import {
	isValidElement, Children,
	type ReactElement, type ReactNode,
} from 'react'

import { verifyChildren } from '@/lib/component/children'
import { AuthAlternate } from './AuthAlternate'
import { AuthBack, AuthContinue, AuthSubmit } from './AuthNavigation'
import { AuthNote } from './AuthContent'
import { AuthResend } from './AuthActions'
import { Button } from '@/components/core/Button'

const NAME = 'AuthFooter' as const
const FORWARD_ACTIONS: unknown[] = [AuthContinue, AuthResend, AuthSubmit]

type FooterSlot =
	| 'alternate' | 'back'
	| 'forward' | 'note'

type FooterSlots =
	Partial<Record<FooterSlot, ReactElement>>

interface AuthFooterProps {
	children: ReactNode
}

const getSlot = (child: ReactElement): FooterSlot | undefined => {
	const { type } = child

	if (type === AuthAlternate) return 'alternate'
	if (type === AuthBack) return 'back'
	if (type === AuthNote) return 'note'
	if (FORWARD_ACTIONS.includes(type)) return 'forward'
	return undefined
}

const sortSlots = (children: ReactNode): FooterSlots => {
	const slots: FooterSlots = {},
		repeated: ReactNode[] = [],
		unrelated: ReactNode[] = []

	Children.toArray(children).forEach(child => {
		if (typeof child === 'string' && !child.trim()) return

		const slot = isValidElement(child) ? getSlot(child) : undefined

		if (!isValidElement(child) || !slot) unrelated.push(child)
		else if (slots[slot]) repeated.push(child)
		else slots[slot] = child
	})

	verifyChildren({ name: NAME, repeated, unrelated })
	return slots
}

export const AuthFooter = ({ children }: AuthFooterProps) => {
	const { alternate, back, forward, note } = sortSlots(children)

	const actions = back && forward
		? <Button.Group hasPriority={ false }>{ back }{ forward }</Button.Group>
		: back ?? forward

	return (
		<div className="authentication">
			{ actions }
			{ alternate }
			{ note }
		</div>
	)
}

AuthFooter.displayName = 'AuthFooter'

export declare namespace AuthFooter {
	export type Props = AuthFooterProps
}
