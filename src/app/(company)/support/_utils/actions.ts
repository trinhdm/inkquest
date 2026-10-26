'use server'

import { artistSchema, clientSchema } from './schema'
import { pause, pickValues, showMessage, type FormState } from '@/lib/form'
import type { z } from 'zod'

const FIELDS = ['name', 'email', 'topic', 'message', 'screenshots'] as const,
	THANKS = 'Thanks, we\'ll reply within 2 working days.'

const send = async (schema: z.ZodType, data: FormData): Promise<FormState> => {
	const values = pickValues(data, FIELDS)

	try {
		const result = schema.safeParse(Object.fromEntries(data))

		if (!result.success)
			return { errors: showMessage(result.error), values }

		await pause(800)

		return { errors: {}, message: THANKS, values: {} }
	} catch {
		return { errors: {}, formError: 'Something went wrong. Try again.', values }
	}
}

export const sendClientSupport = async (_prev: FormState, data: FormData) =>
	send(clientSchema, data)

export const sendArtistSupport = async (_prev: FormState, data: FormData) =>
	send(artistSchema, data)
