import { CODE_EXPIRY } from '@/lib/form'
import type { AccountValues } from '@/lib/auth/schema'
import type { FormResults } from '@/lib/form/types'

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

export const getFirstName = ({ name }: AccountValues) =>
	name?.trim().split(/\s+/)[0]

export const writeExpiryText = (text: string, expiration: number = CODE_EXPIRY) =>
	`${text} It expires in ${expiration / 60} minutes.`
