'use server'

import { action, MOCK_ACCOUNT, type FormAction } from '@/lib/form'
import { loginSchema, magicSchema, resetSchema } from './schema'
import { startSession } from '../../_utils/session'
import type z from 'zod'

const checkLogin = action(loginSchema, {
	names: ['email'],
	conditions: [{
		check: ({ password }) => password === 'wrong',
		formError: 'Email or password is incorrect.',
	}],
})

//	mock: everyone who gets in is MOCK_ACCOUNT
export const login: FormAction = async (prev, data) => {
	const state = await checkLogin(prev, data)
	if (state.success) await startSession(MOCK_ACCOUNT)
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
