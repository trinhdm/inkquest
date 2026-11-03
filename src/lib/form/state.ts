import { z } from 'zod'

export type FormSSO =
	| 'Apple' | 'Google'

export type FormErrors =
	Record<string, string | undefined>

export interface FormState {
	errors: FormErrors
	formError?: string
	message?: string
	success?: boolean
	values: Record<string, string>
}

export interface FormResults<T = FormState> {
	action: (data: FormData) => void
	pending: boolean
	state: T
}

export type FormAction =
	(prev: FormState, data: FormData) => Promise<FormState>

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

export const pause = (ms: number) =>
	new Promise(resolve => setTimeout(resolve, ms))

export const pickValues = (data: FormData, names: readonly string[]): FormState['values'] =>
	Object.fromEntries(names.map(name => [name, String(data.get(name) ?? '')]))

export const validateWith = (schema: z.ZodType) => (data: FormData): FormErrors => {
	const result = schema.safeParse(Object.fromEntries(data))
	return result.success ? {} : showMessage(result.error)
}
