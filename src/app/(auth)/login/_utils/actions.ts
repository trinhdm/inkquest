'use server'

import { action } from '@/lib/form'
import { loginSchema, magicSchema, resetSchema } from './schema'
import type z from 'zod'

export const login = action(loginSchema, {
	names: ['email'],
	conditions: [{
		check: ({ password }) => password === 'wrong',
		formError: 'Email or password is incorrect.',
	}],
})


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
