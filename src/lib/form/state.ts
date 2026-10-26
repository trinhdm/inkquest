import { z } from 'zod'

export type FormErrors =
	Record<string, string | undefined>

export interface FormState {
	errors: FormErrors
	formError?: string
	message?: string
	success?: boolean
	values: Record<string, string>
}

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

export const pickValues = (data: FormData, names: readonly string[]): FormState['values'] =>
	Object.fromEntries(names.map(name => [name, String(data.get(name) ?? '')]))
