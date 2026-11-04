'use server'

import {
	action,
	BASE_ERROR, FAIL_CONTACT,
	MOCK_ACCOUNT, MOCK_INCORRECT,
} from '@/lib/form'

import { contactSchema, signupSchema, verifySchema } from './schema'
import { forgetAccount } from '@/lib/auth/account'
import { getContact, maskContact } from './helpers'
import { startSession } from '@/lib/auth/session'
import { METHOD_DATA } from './data'
import type { FormAction } from '@/lib/form/types'

//	hidden fields can't show their own error, so it shows as a form error instead
const withHiddenErrors = (formAction: FormAction, hidden: readonly string[]): FormAction =>
	async (prev, data) => {
		const state = await formAction(prev, data)
		return hidden.some(name => state.errors[name]) ? { ...state, formError: BASE_ERROR } : state
	}

const start = action(signupSchema, {
	names: ['email', 'method', 'tel'],
	conditions: [{
		check: data => FAIL_CONTACT.includes(getContact(data)),
		formError: BASE_ERROR,
	}],
	onSuccess: (data, values) => {
		const contact = getContact(data),
			destination = maskContact({ contact, method: data.method })
		return { values: { ...values, contact, destination } }
	},
})

export const signup = withHiddenErrors(start, ['method'])


//	resend

const sendAgain = action(contactSchema, {
	conditions: [{
		check: ({ contact }) => contact.includes(MOCK_INCORRECT.failResend),
		formError: BASE_ERROR,
	}],
	onSuccess: data => {
		const destination = maskContact(data),
			verification = METHOD_DATA[data.method].verify['type']
		return { message: `We sent another ${verification} to ${destination}.` }
	},
})

export const resend = withHiddenErrors(sendAgain, ['contact', 'method'])


//	verify

const checkCode = action(verifySchema, {
	conditions: [
		{
			check: ({ code }) => code.includes(MOCK_INCORRECT.wrongCode),
			errors: { code: `That code isn't right. Check it and try again.` },
		},
		{
			check: ({ code }) => code.includes(MOCK_INCORRECT.expiredCode),
			formError: 'That code has expired. Resend to get a new one.',
		},
	],
})

const verifyCode: FormAction = async (prev, data) => {
	const state = await checkCode(prev, data)

	if (state.success) {
		await startSession(MOCK_ACCOUNT)
		await forgetAccount()
	}

	return state
}

export const verify = withHiddenErrors(verifyCode, ['contact', 'method'])
