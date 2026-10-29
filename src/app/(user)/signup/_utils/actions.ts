'use server'

import {
	action,
	BASE_ERROR, MOCK_DATA,
	type FormState,
} from '@/lib/form'

import { maskTo, pickTo } from './helpers'
import { resendSchema, signupSchema, verifySchema } from './schema'

const FAIL_TO: string[] = [MOCK_DATA.failEmail, MOCK_DATA.failTel]

const start = action(signupSchema, {
	names: ['email', 'method', 'tel'],
	conditions: [{
		check: data => FAIL_TO.includes(pickTo(data)),
		formError: BASE_ERROR,
	}],
	onSuccess: (data, values) => ({
		values: { ...values, to: maskTo(data.method, pickTo(data)) },
	}),
})

export const signup = async (prev: FormState, data: FormData): Promise<FormState> => {
	const state = await start(prev, data)
	return state.errors.method ? { ...state, formError: BASE_ERROR } : state
	//	`method` is a hidden field, so its error shows as a form error instead
}

export const resend = action(resendSchema)
export const verify = action(verifySchema)
