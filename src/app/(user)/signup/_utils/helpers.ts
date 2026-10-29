import { PASSWORD_RULES } from './signup.data'
import type { SignupMethod } from './signup.context'

const listFormat = new Intl.ListFormat('en', { type: 'conjunction' })

//	lists which password criteria is still missing
export const describeMissing = (value: string) => {
	const missing = PASSWORD_RULES.filter(rule => !rule.test(value))
	if (!missing.length) return undefined

	return `Your password needs ${listFormat.format(
		missing.map(({ label }) => label.toLowerCase())
	)}.`
}

export const maskTo = (method: SignupMethod, to: string) =>
	method === 'tel' ? `•••-${to.slice(-4)}` : to
