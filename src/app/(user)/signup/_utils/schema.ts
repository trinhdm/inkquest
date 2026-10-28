import { z } from 'zod'
import { emailRule, validateWith } from '@/lib/form'


//	SignupRoot

export type SignupValues =
	z.infer<typeof signupSchema>

export const signupSchema = z.object({
	email: emailRule,
	password: z.string().min(1, `Password doesn't meet the requirements.`),
})

export const validateSignup = validateWith(signupSchema)


//	SignupMagic

export type MagicValues =
	z.infer<typeof magicSchema>

export const magicSchema = z.object({ email: emailRule })
const validateMagic = validateWith(magicSchema)


//	SignupVerify

export type VerifyValues =
	z.infer<typeof verifySchema>

export const verifySchema = z.object({ email: emailRule })
export const validateVerify = validateWith(verifySchema)


//	SignupResend

export type ResendValues =
	z.infer<typeof resendSchema>

export const resendSchema = z.object({ email: emailRule })
export const validateResend = validateWith(resendSchema)


//	general

export const validateSignupForm = (data: FormData) =>
	data.get('intent') === 'magic' ? validateMagic(data) : validateSignup(data)
