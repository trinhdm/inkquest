import { useState, type ChangeEvent } from 'react'
import { useSignupCtx } from '../_utils/signup.context'
import { AuthOptions } from './AuthOptions'
import { Field } from '@/components/form/Field'
import { METHOD_DATA } from '../_utils/signup.data'
import { PLACEHOLDER } from '@/lib/form'

export const ContactField = () => {
	const {
		idx, method,
		signup: { pending, state },
	} = useSignupCtx()

	const [contact, setContact] = useState({
		email: state.values.email ?? '',
		tel: state.values.tel ?? '',
	})

	const { field: { label, type } } = METHOD_DATA[method.active]

	const handleContact = (event: ChangeEvent<HTMLInputElement>) =>
		setContact({ ...contact, [type]: event.currentTarget.value })

	return (
		<Field
			required
			disabled={ pending }
			id={ `${idx.field}-${method}` }
			label={ label }
			caption={ <AuthOptions /> }
		>
			<Field.Input
				autoComplete={ type }
				key={ type }
				name={ type }
				onChange={ handleContact }
				placeholder={ PLACEHOLDER[type] }
				type={ type }
				value={ contact[type] }
			/>
		</Field>
	)
}

ContactField.displayName = 'ContactField'
