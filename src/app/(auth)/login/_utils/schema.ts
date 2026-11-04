import { z } from 'zod'
import { emailRule, validateWith } from '@/lib/form'

//	LoginRoot

export type LoginValues =
	z.infer<typeof loginSchema>

export const loginSchema = z.object({
	email: emailRule,
	password: z.string().min(1, 'Enter your password.'),
})

const validateLogin = validateWith(loginSchema)


const sharedSchema = {
	email: emailRule,
	resent: z.stringbool().optional(),
}


//	LoginReset

export type ResetValues =
	z.infer<typeof resetSchema>

export const resetSchema = z.object(sharedSchema)
export const validateReset = validateWith(resetSchema)


//	LoginMagic

export type MagicValues =
	z.infer<typeof magicSchema>

export const magicSchema = z.object(sharedSchema)
const validateMagic = validateWith(magicSchema)


//	general

export const validateLoginForm = (data: FormData) =>
	data.get('intent') === 'magic' ? validateMagic(data) : validateLogin(data)
