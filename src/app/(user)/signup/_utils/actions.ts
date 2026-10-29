'use server'

import {
	actionable, pause,
	pickValues, showMessage,
	BASE_ERROR,
	type FormState,
} from '@/lib/form'

import { magicSchema, resendSchema, signupSchema, verifySchema } from './schema'
import { maskTo } from './helpers'
import { MOCK_DEMO } from './signup.data'

export const signup = async (_prev: FormState, data: FormData): Promise<FormState> => {
	const values = pickValues(data, ['email', 'magic', 'tel']),
		base = { errors: {}, values }

	try {
		const result = signupSchema.safeParse(Object.fromEntries(data))

		if (!result.success) {
			const errors = showMessage(result.error),
				formError = errors.method ? BASE_ERROR : undefined
			return { errors, formError, values }
		}

		await pause(800)

		const start = result.data,
			to = start.method === 'tel' ? start.tel : start.email

		if (to === MOCK_DEMO.failEmail || to === MOCK_DEMO.failTel)
			return { ...base, formError: BASE_ERROR }

		return { ...base, success: true, values: { ...values, to: maskTo(start.method, to) } }
	} catch {
		return { ...base, formError: BASE_ERROR }
	}
}

export const magicSignup = actionable(magicSchema)
export const resendSignup = actionable(resendSchema)

export const verify = actionable(verifySchema)
