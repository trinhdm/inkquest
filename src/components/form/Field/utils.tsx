import {
	Calendar, Calendar1, CalendarDays,
	Clock, Eye, Globe,
	Hash, Mail, Paperclip,
	Phone, Pipette, Search,
} from 'lucide-react'

import { keyHasValue } from '@/utils/helpers'
import type { HTMLInputTypeAttribute } from 'react'
import type { Field } from './Field'
import type { Form } from '../Form'
import type { SafeRootCtxValue } from '@/lib/component/context'

type FieldSpecsList = {
	group: Field.Group.Specs
	root: Field.Specs
}

type FieldName =
	keyof FieldSpecsList

interface FormErrorsArgs<N extends FieldName> {
	context?: {
		form?: SafeRootCtxValue<Form.Context, 'Form'>
		group?: SafeRootCtxValue<Field.Group.Context, 'Field.Group'>
	}
	name: string | undefined
	props: FieldSpecsList[N]['props']
}

export const getFormErrors = <N extends FieldName>({
	context = {},
	name,
	props,
}: FormErrorsArgs<N>) => {
	const { form, group } = context ?? { form: undefined, group: undefined }

	const formError = name && !group ? form?.errors[name] : undefined,
		propError = keyHasValue(props, 'error') && typeof props.error === 'string'
			? props.error
			: undefined

	const error = propError ?? formError,
		invalid = keyHasValue(props, 'invalid') ? props.invalid : undefined

	const hasError = !!error?.trim(),
		isInvalid = hasError || !!invalid

	return { error, hasError, isInvalid }
}

export const getIcon = (type?: HTMLInputTypeAttribute) => {
	switch (type) {
		case 'color':		return <Pipette />
		case 'date':		return <Calendar />
		case 'email':		return <Mail />
		case 'file':		return <Paperclip />
		case 'month':		return <Calendar1 />
		case 'number':		return <Hash />
		case 'password':	return <Eye />
		case 'search':		return <Search />
		case 'tel':			return <Phone />
		case 'time':		return <Clock />
		case 'url':			return <Globe />
		case 'week':		return <CalendarDays />
		default:			return null
	}
}
