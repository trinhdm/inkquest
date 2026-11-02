import { keyHasValue } from '@/utils/helpers'
import { PASSWORD_RULES } from './signup.data'
import type { SignupMethod } from './signup.context'
import type { SignupValues } from './schema'

const listFormat = new Intl.ListFormat('en', { type: 'conjunction' })

const getWeight = (str: string): 0 | 1 | 2 =>
	str.startsWith('at')
		? 0 : str.startsWith('no')
			? 2 : 1

//	lists which password criteria is still missing
export const describeMissing = (value: string) => {
	const missing = PASSWORD_RULES.filter(rule => !rule.test(value)),
		parts = []

	if (!missing.length) return undefined

	for (const rule of missing) {
		const label = keyHasValue(rule, 'error') && typeof rule.error === 'string'
			? rule.error : rule.label
		parts.push(label.toLowerCase())
	}

	const message = listFormat.format(parts.sort((a, b) =>
		getWeight(a) - getWeight(b) || a.localeCompare(b)
	))

	return `Password must contain ${message}.`
}

export const maskTo = (method: SignupMethod, to: string) =>
	method === 'phone' ? `•••-${to.slice(-4)}` : to


export const pickTo = (data: SignupValues) =>
	data.method === 'phone' ? data.tel : data.email
