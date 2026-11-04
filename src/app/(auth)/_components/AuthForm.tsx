import {
	isValidElement, Children,
	type ComponentProps,
	type ReactElement, type ReactNode,
} from 'react'

import {
	AuthAlternate, AuthBack, AuthContinue,
	AuthFooter, AuthHeader, AuthNote,
	AuthResend, AuthSubmit,
} from './_parts'

import { verifyChildren } from '@/lib/component/children'
import { Form } from '@/components/form/Form'
import { Section } from '@/components/layout/Section'
import type { AuthFormIDs } from '../_utils/types'
import type { FormResults } from '@/lib/form/types'

const NAME = 'AuthForm' as const

const SUBCOMPONENTS = {
	Alternate:	AuthAlternate,
	Back:		AuthBack,
	Continue:	AuthContinue,
	Footer:		AuthFooter,
	Header:		AuthHeader,
	Note:		AuthNote,
	Resend:		AuthResend,
	Submit:		AuthSubmit,
} as const

type AuthFormArgs =
	& Partial<FormResults>
	& Pick<Form.Props, 'children' | 'feedback' | 'onSubmit' | 'validate'>

interface AuthFormProps
	extends AuthFormArgs {
	idx: AuthFormIDs
}

const sortAuthSlots = (children: ReactNode) => {
	const fields: ReactNode[] = []
	let footer: ReactElement<AuthFooter.Props> | undefined,
		header: ReactElement<AuthHeader.Props> | undefined

	Children.toArray(children).forEach(child => {
		if (isValidElement<AuthHeader.Props>(child) && child.type === AuthHeader) {
			if (!header) header = child
			else verifyChildren({ name: NAME, repeated: [child] })
			return
		}

		if (isValidElement<AuthFooter.Props>(child) && child.type === AuthFooter) {
			if (!footer) footer = child
			else verifyChildren({ name: NAME, repeated: [child] })
			return
		}

		fields.push(child)
	})

	verifyChildren({
		children: header,
		name: { childName: 'AuthHeader', parentName: NAME },
		total: 1,
	})

	return { fields, footer, header }
}

export const AuthFormRoot = ({
	action,
	children,
	feedback,
	idx,
	onSubmit,
	pending,
	state,
	validate,
}: AuthFormProps) => {
	const { fields, footer, header } = sortAuthSlots(children)
	const { children: description, eyebrow, title } = header?.props ?? {}

	return (
		<Section
			eyebrow={ eyebrow }
			id={ idx.section }
			layout="content-form"
			tabIndex={ -1 }
			title={ title }
		>
			{ !!description && <>{ description }</> }

			<Form
				action={ action }
				feedback={ feedback }
				id={ idx.form }
				onSubmit={ onSubmit }
				pending={ pending }
				state={ state }
				validate={ validate }
			>
				{ fields }
				{ footer }
			</Form>
		</Section>
	)
}

AuthFormRoot.displayName = NAME
export const AuthForm = Object.assign(AuthFormRoot, SUBCOMPONENTS)

export declare namespace AuthForm {
	type Parts = typeof SUBCOMPONENTS
	export type Props<K extends keyof Parts | 'Root' = 'Root'> =
		K extends keyof Parts ? ComponentProps<Parts[K]> : AuthFormProps
}
