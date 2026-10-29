'use server'

import { action } from '@/lib/form'
import { loginSchema, magicSchema, resetSchema } from './schema'

export const login = action(loginSchema, {
	conditions: [{
		check: data => data.password === 'wrong',
		formError: 'Email or password is incorrect.',
	}],
})

export const magicLogin = action(magicSchema)
export const requestReset = action(resetSchema)
