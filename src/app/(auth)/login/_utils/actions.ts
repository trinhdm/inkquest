'use server'

import {
	action,
	MOCK_ACCOUNT, MOCK_INCORRECT,
} from '@/lib/form'

import { loginSchema, magicSchema, resetSchema } from './schema'
import { signIn } from '@/lib/auth'
import type z from 'zod'
import type { FormAction } from '@/lib/form/types'

const checkLogin = action(loginSchema, {
	names: ['email'],
	conditions: [{
		check: ({ password }) => password === MOCK_INCORRECT.wrongPassword,
		formError: 'Email or password is incorrect.',
	}],
})

//	mock: everyone who gets in is MOCK_ACCOUNT
export const login: FormAction = async (prev, data) => {
	const state = await checkLogin(prev, data)
	if (state.success) await signIn(MOCK_ACCOUNT)
	return state
}


type ActionConfig<S extends z.ZodType> =
	NonNullable<Parameters<typeof action<S>>[1]>

const sharedAction = {
	names: ['email'],
	onSuccess: ({ email, resent }) => ({
		message: resent ? `We sent another link to ${email}.` : undefined,
	}),
} satisfies ActionConfig<typeof magicSchema | typeof resetSchema>

export const magicLogin = action(magicSchema, sharedAction)
export const requestReset = action(resetSchema, sharedAction)
