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

export const signup: FormAction = async (prev, data) => {
	const state = await start(prev, data)
	return state.errors.method ? { ...state, formError: BASE_ERROR } : state
	//	`method` is a hidden field, so its error shows as a form error instead
}


//	resend

export const resend = action(contactSchema, {
	conditions: [{
		check: ({ contact }) => contact.includes(MOCK_INCORRECT.failResend),
		formError: BASE_ERROR,
	}],
	onSuccess: ({ contact, method }) => ({
		message: `We sent another ${METHOD_DATA[method]} to ${contact}.`,
	}),
})


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

export const verify: FormAction = async (prev, data) => {
	const state = await checkCode(prev, data)

	if (state.success) {
		await startSession(MOCK_ACCOUNT)
		await forgetAccount()
	}

	return state
}
