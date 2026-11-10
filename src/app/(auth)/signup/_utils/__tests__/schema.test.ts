import { contactSchema, signupSchema, validateVerifyForm, verifySchema } from '../schema'

const form = (fields: Record<string, string>) => {
	const data = new FormData()
	for (const [name, value] of Object.entries(fields)) data.set(name, value)
	return data
}

describe('signupSchema', () => {
	it('accepts an email signup with a valid password', () => {
		const result = signupSchema.safeParse({ method: 'email', email: 'a@b.co', password: 'Hzqmxw1!' })

		expect(result.success).toBe(true)
	})

	it('needs a password for the email method', () => {
		const result = signupSchema.safeParse({ method: 'email', email: 'a@b.co' })

		expect(result.success).toBe(false)
	})

	it('rejects an empty password with its own message', () => {
		const result = signupSchema.safeParse({ method: 'email', email: 'a@b.co', password: '' })

		expect(result.error?.issues[0].message).toBe('Enter a password.')
	})

	it('rejects a password under the sequence-check length with a generic message', () => {
		const result = signupSchema.safeParse({ method: 'email', email: 'a@b.co', password: 'abc' })

		expect(result.error?.issues[0].message).toBe(`Password doesn't meet the requirements.`)
	})

	it('lists what a longer weak password is missing', () => {
		const result = signupSchema.safeParse({ method: 'email', email: 'a@b.co', password: 'abcd' })

		expect(result.error?.issues[0].message).toMatch(/^Password must contain /)
	})

	it('does not need a password for the magic method', () => {
		expect(signupSchema.safeParse({ method: 'magic', email: 'a@b.co' }).success).toBe(true)
	})

	it('does not need a password for the phone method', () => {
		expect(signupSchema.safeParse({ method: 'phone', tel: '(555) 123-4567' }).success).toBe(true)
	})

	it('formats tel to +1 and 10 digits', () => {
		const result = signupSchema.safeParse({ method: 'phone', tel: '(555) 123-4567' })

		expect(result.data).toEqual({ method: 'phone', tel: '+15551234567' })
	})

	it('rejects an invalid email', () => {
		expect(signupSchema.safeParse({ method: 'magic', email: 'nope' }).success).toBe(false)
	})

	it('rejects a short phone number', () => {
		expect(signupSchema.safeParse({ method: 'phone', tel: '555' }).success).toBe(false)
	})

	it('rejects a missing method', () => {
		const result = signupSchema.safeParse({ email: 'a@b.co', password: 'Hzqmxw1!' })

		expect(result.success).toBe(false)
		expect(result.error?.issues[0].path).toEqual(['method'])
	})

	it('rejects an unknown method', () => {
		const result = signupSchema.safeParse({ method: 'fax', email: 'a@b.co' })

		expect(result.success).toBe(false)
		expect(result.error?.issues[0].path).toEqual(['method'])
	})
})

describe('contactSchema', () => {
	it('accepts the +1… contact it produces itself', () => {
		const result = contactSchema.safeParse({ method: 'phone', contact: '+15551234567' })

		expect(result.success).toBe(true)
		expect(result.data?.contact).toBe('+15551234567')
	})

	it('rejects a masked destination as a phone contact', () => {
		expect(contactSchema.safeParse({ method: 'phone', contact: '•••-4567' }).success).toBe(false)
	})

	it.each(['email', 'magic'])('needs an email contact for %s', method => {
		expect(contactSchema.safeParse({ method, contact: 'a@b.co' }).success).toBe(true)
		expect(contactSchema.safeParse({ method, contact: '+15551234567' }).success).toBe(false)
	})

	it('rejects an unknown method', () => {
		expect(contactSchema.safeParse({ method: 'fax', contact: 'a@b.co' }).success).toBe(false)
	})
})

describe('verifySchema', () => {
	it('strips spaces from the code', () => {
		const result = verifySchema.safeParse({ method: 'email', contact: 'a@b.co', code: '123 456' })

		expect(result.data?.code).toBe('123456')
	})

	it('rejects a short code', () => {
		const result = verifySchema.safeParse({ method: 'email', contact: 'a@b.co', code: '123' })

		expect(result.success).toBe(false)
	})

	it('rejects a non-numeric code', () => {
		const result = verifySchema.safeParse({ method: 'email', contact: 'a@b.co', code: 'abcdef' })

		expect(result.success).toBe(false)
	})
})

describe('validateVerifyForm', () => {
	it('flags a short code', () => {
		expect(validateVerifyForm(form({ code: '123' }))).toEqual({ code: 'Enter the 6-digit code.' })
	})

	it('accepts a full code, spaces and all', () => {
		expect(validateVerifyForm(form({ code: '123 456' }))).toEqual({})
	})

	it('skips the code check when the resend button submitted the form', () => {
		expect(validateVerifyForm(form({ intent: 'resend', code: '' }))).toEqual({})
	})
})
