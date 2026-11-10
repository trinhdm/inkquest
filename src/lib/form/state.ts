import { z } from 'zod'
import type { FormErrors, FormState } from './types'

export const initFormState: FormState = {
	errors: {},
	values: {},
}

export const showMessage = (error: z.ZodError): FormState['errors'] => {
	const { fieldErrors } = z.flattenError(error),
		errors = Object.entries(fieldErrors as Record<string, string[] | undefined>),
		messages: FormState['errors'] = {}

	for (const [name, list] of errors) {
		const first = list?.[0]
		if (first) messages[name] = first
	}

	return messages
}

export const pause = (ms: number): Promise<void> =>
	new Promise<void>(resolve => setTimeout(resolve, ms))

export const pickValues = (data: FormData, names: readonly string[]): FormState['values'] =>
	Object.fromEntries(names.map(name => [name, String(data.get(name) ?? '')]))

export const validateWith = (schema: z.ZodType) => (data: FormData): FormErrors => {
	const result = schema.safeParse(Object.fromEntries(data))
	return result.success ? {} : showMessage(result.error)
}
