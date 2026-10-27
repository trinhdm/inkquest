import { z } from 'zod'
import { emailRule, validateWith } from '@/lib/form'


//	LoginRoot

export type LoginValues =
	z.infer<typeof loginSchema>

export const loginSchema = z.object({
	email: emailRule,
	password: z.string().min(1, 'Enter your password.'),
})

export const validateLogin = validateWith(loginSchema)


//	LoginReset

export type ResetValues =
	z.infer<typeof resetSchema>

export const resetSchema = z.object({ email: emailRule })
export const validateReset = validateWith(resetSchema)


//	LoginMagic

export type MagicValues =
	z.infer<typeof magicSchema>

export const magicSchema = z.object({ email: emailRule })
const validateMagic = validateWith(magicSchema)


//	general

export const validateEmailLogin = (data: FormData) =>
	data.get('intent') === 'magic' ? validateMagic(data) : validateLogin(data)
