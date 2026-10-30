import { PASSWORD_RULES } from './signup.data'
import type { SignupMethod } from './signup.context'
import type { SignupValues } from './schema'

const listFormat = new Intl.ListFormat('en', { type: 'conjunction' })

//	lists which password criteria is still missing
export const describeMissing = (value: string) => {
	const missing = PASSWORD_RULES.filter(rule => !rule.test(value))
	if (!missing.length) return undefined

	return `Password needs ${listFormat.format(
		missing.map(({ label }) => label.toLowerCase())
	)}.`
}

export const maskTo = (method: SignupMethod, to: string) =>
	method === 'phone' ? `•••-${to.slice(-4)}` : to


export const pickTo = (data: SignupValues) =>
	data.method === 'phone' ? data.tel : data.email
