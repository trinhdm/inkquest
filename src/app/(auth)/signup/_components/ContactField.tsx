import {
	useEffect, useRef, useState,
	type ChangeEvent,
} from 'react'

import { useSignupCtx } from '../_utils/context'
import { AuthOptions } from './AuthOptions'
import { Field } from '@/components/form/Field'
import { METHOD_DATA } from '../_utils/data'
import { PLACEHOLDER } from '@/lib/form'

export const ContactField = () => {
	const {
		idx,
		method: { active: method },
		signup: { pending, state },
	} = useSignupCtx()

	const [contact, setContact] = useState({
		email: state.values.email ?? '',
		tel: state.values.tel ?? '',
	})

	const lastMethod = useRef(method)
	const { field: { label, type } } = METHOD_DATA[method]

	useEffect(() => {			//	switches focus on method change
		if (lastMethod.current === method) return

		lastMethod.current = method
		document.getElementById(idx.form)
			?.querySelector<HTMLInputElement>(`input[name="${type}"]`)
			?.focus()
	}, [idx.form, method, type])

	const handleContact = (event: ChangeEvent<HTMLInputElement>) => {
		const { value } = event.currentTarget
		setContact(prev => ({ ...prev, [type]: value }))
	}

	return (
		<Field
			required
			caption={ <AuthOptions /> }
			describeCaption={ false }
			disabled={ pending }
			id={ `${idx.field}-${method}` }
			label={ label }
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
