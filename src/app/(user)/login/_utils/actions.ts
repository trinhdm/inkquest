'use server'

import {
	actionable, pause,
	pickValues, showMessage,
	type FormState,
} from '@/lib/form'

import { loginSchema, magicSchema, resetSchema } from './schema'

export const login = async (_prev: FormState, data: FormData): Promise<FormState> => {
	const values = pickValues(data, ['email']),
		base = { errors: {}, values }

	try {
		const result = loginSchema.safeParse(Object.fromEntries(data))

		if (!result.success)
			return { errors: showMessage(result.error), values }

		await pause(800)

		if (result.data.password === 'wrong')
			return { ...base, formError: 'Email or password is incorrect.' }

		return { ...base, success: true }
	} catch {
		return { ...base, formError: 'Something went wrong. Try again.' }
	}
}

export const magicLogin = actionable(magicSchema)
export const requestReset = actionable(resetSchema)
