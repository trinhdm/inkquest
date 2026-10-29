import { z } from 'zod'
import { describeMissing } from './helpers'
import { emailRule, telRule, validateWith } from '@/lib/form'

const passwordRule = z.string()
	.min(1, `Password doesn't meet the requirements.`)
	.superRefine((value, ctx) => {
		const message = describeMissing(value)
		if (message) ctx.addIssue({ code: 'custom', message })
	})


//	SignupRoot

export type SignupValues =
	z.infer<typeof signupSchema>

const emailSignup = z.object({
	method: z.literal('email'),
	email: emailRule,
	password: passwordRule,
})

const magicSignup = z.object({
	method: z.literal('magic'),
	email: emailRule,
})

const telSignup = z.object({
	method: z.literal('phone'),
	tel: telRule,
})

export const signupSchema = z.discriminatedUnion(
	'method',
	[emailSignup, telSignup, magicSignup],
)

export const validateSignup = validateWith(signupSchema)


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
