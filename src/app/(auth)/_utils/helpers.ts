import type { FormResults } from '@/lib/form'
import type { RememberedAccount } from './account'

export const getAuthFormIDs = <T extends string>(
	pageID: string,
	screen: T
) => ({
	field: `${screen}-field`,
	form: `form-${screen}`,
	section: `${pageID}-${screen}`,
	timer: `${screen}-timer`,
})

export const omitMessage = (form: FormResults): FormResults => ({
	...form,
	state: { ...form.state, message: undefined },
})

//	parse account details

export const getInitials = ({ email, name }: RememberedAccount) =>
	(name ?? email)
		.trim()
		.split(/\s+/)
		.slice(0, 2)
		.map(word => Array.from(word)[0])
		.join('')
		.toUpperCase()

export const getFirstName = ({ name }: RememberedAccount) =>
	name?.trim().split(/\s+/)[0]
