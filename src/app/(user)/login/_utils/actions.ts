'use server'

import { z } from 'zod'
import { loginSchema, magicSchema, resetSchema } from './schema'
import { pause, pickValues, showMessage, type FormState } from '@/lib/form'

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

const request = (schema: z.ZodType) =>
	async (_prev: FormState, data: FormData): Promise<FormState> => {
		const values = pickValues(data, ['email']),
			base = { errors: {}, values }

		try {
			const result = schema.safeParse(Object.fromEntries(data))

			if (!result.success) return { errors: showMessage(result.error), values }
			await pause(800)

			return { ...base, success: true }
		} catch {
			return { ...base, formError: 'Something went wrong. Try again.' }
		}
	}

export const requestMagicLink = request(magicSchema)
export const requestReset = request(resetSchema)
