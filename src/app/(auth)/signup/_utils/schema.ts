import { z } from 'zod'
import { describeMissing } from './helpers'
import { emailRule, telRule, validateWith } from '@/lib/form'
import { CODE_LENGTH, SEQUENCE_CHECK_MIN } from './data'

const CODE_PATTERN = new RegExp(`^\\d{${CODE_LENGTH}}$`)

const codeRule = z.string()
	.transform(value => value.replace(/\s/g, ''))
	.refine(
		value => CODE_PATTERN.test(value),
		{ message: `Enter the ${CODE_LENGTH}-digit code.` }
	)

const passwordRule = z.string()
	.min(1, `Enter a password.`)
	.superRefine((value, ctx) => {
		const isShort = value.length < SEQUENCE_CHECK_MIN
		const message = isShort
			? `Password doesn't meet the requirements.`
			: describeMissing(value)

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


//	SignupVerify and SignupMagic

export type ContactValues =
	z.infer<typeof contactSchema>

//	hidden fields that carry step 1's contact to the next request
export const contactSchema = z.discriminatedUnion('method', [
	z.object({ method: z.literal('email'), contact: emailRule }),
	z.object({ method: z.literal('magic'), contact: emailRule }),
	z.object({ method: z.literal('phone'), contact: telRule }),
])

const codeSchema = z.object({ code: codeRule })
const validateCode = validateWith(codeSchema)


//	resend code

export type VerifyValues =
	z.infer<typeof verifySchema>

export const verifySchema = z.intersection(codeSchema, contactSchema)

//	resend button shares this form but has no code to check
export const validateVerifyForm = (data: FormData) =>
	data.get('intent') === 'resend' ? {} : validateCode(data)
