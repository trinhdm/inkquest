import { Form } from '@/components/form/Form'
import { Section } from '@/components/layout/Section'
import type { AuthFormIDs } from '../_utils/types'
import type { FormResults } from '@/lib/form'

type AuthFormArgs =
	& Partial<FormResults>
	& Pick<Form.Props, 'onSubmit' | 'validate'>

type AuthHeaderArgs = {
	description?: Section.Props['children']
	eyebrow?: Section.Props['eyebrow']
	title: NonNullable<Section.Props['title']>
}

interface AuthFormProps {
	children: Form.Props['children']
	form?: AuthFormArgs
	header: AuthHeaderArgs
	idx: AuthFormIDs
}

export const AuthForm = ({
	children,
	header,
	form,
	idx,
}: AuthFormProps) => {
	const { description, ...headerProps } = header
	const formProps = form ?? {}

	return (
		<Section
			{ ...headerProps }
			id={ idx.section }
			layout="content-form"
			tabIndex={ -1 }
		>
			{ description }

			<Form { ...formProps } id={ idx.form }>
				{ children }
			</Form>
		</Section>
	)
}

AuthForm.displayName = 'AuthForm'

export declare namespace AuthForm {
	export type Props = AuthFormProps
}
