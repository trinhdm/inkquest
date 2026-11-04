import type { RequireSome } from '@/types/utils'

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

type FormResponse =
	Partial<Pick<FormState, 'message' | 'values'>>

type FormFeedback =
	Partial<Omit<FormState, 'success' | 'values'>>

type RequireFeedback<T extends keyof FormFeedback = keyof FormFeedback> = {
	[K in T]: RequireSome<FormFeedback, K>
}[T]

//	an action's `run` return value
export type ActionReply =
	| ({ success: true } & FormResponse)
	| ({ success: false } & RequireFeedback)

export type FormAction =
	(prev: FormState, data: FormData) => Promise<FormState>
