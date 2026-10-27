import { z } from 'zod'
import { emailRule, validateWith } from '@/lib/form'

//	LoginForm

export type LoginValues =
	z.infer<typeof loginSchema>

export const loginSchema = z.object({
	email: emailRule,
	password: z.string().min(1, 'Enter your password.'),
})

export const validateLogin = validateWith(loginSchema)


//	ResetForm

export type ResetValues =
	z.infer<typeof resetSchema>

export const resetSchema = z.object({ email: emailRule })
export const validateReset = validateWith(resetSchema)
