
//	state

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
