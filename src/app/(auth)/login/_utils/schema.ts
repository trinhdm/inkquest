import { z } from 'zod'
import { emailRule, validateWith } from '@/lib/form'

//	StartLogin

export const loginSchema = z.object({
	email: emailRule,
	password: z.string().min(1, 'Enter your password.'),
})

const validateLogin = validateWith(loginSchema)

//	MagicLogin + ResetPassword

const sharedSchema = {
	email: emailRule,
	resent: z.stringbool().optional(),
}

export const magicSchema = z.object(sharedSchema)
const validateMagic = validateWith(magicSchema)

export const resetSchema = z.object(sharedSchema)
export const validateReset = validateWith(resetSchema)

export const validateLoginForm = (data: FormData) =>
	data.get('intent') === 'magic' ? validateMagic(data) : validateLogin(data)
