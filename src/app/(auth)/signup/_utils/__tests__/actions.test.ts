/**
 * @jest-environment node
 */

// The signup step actions, run against an in-memory cookie store. pause() is stubbed
// so the 800 ms mock delay doesn't slow the suite. Inputs are FormData shaped like
// the ones the real forms post (see HiddenFields and the _form screens).
import { BASE_ERROR, FAIL_CONTACT, MOCK_ACCOUNT, MOCK_INCORRECT } from '@/lib/form'
import { resend, signup, verify } from '../actions'

const mockStore = new Map<string, string>()

jest.mock('next/headers', () => ({
	cookies: async () => ({
		get: (name: string) => {
			const value = mockStore.get(name)
			return value === undefined ? undefined : { name, value }
		},
		set: (name: string, value: string) => {
			mockStore.set(name, value)
		},
		delete: (name: string) => {
			mockStore.delete(name)
		},
	}),
}))

jest.mock('next/navigation', () => ({
	RedirectType: { push: 'push', replace: 'replace' },
	redirect: jest.fn((url: string) => {
		throw new Error(`NEXT_REDIRECT ${url}`)
	}),
}))

jest.mock('@/lib/form/state', () => ({
	...jest.requireActual('@/lib/form/state'),
	pause: jest.fn(async () => undefined),
}))

const SESSION = 'inkq_session',
	REMEMBERED = 'inkq_last_account',
	HINT = 'inkq_login_hint'

const PREV = { errors: {}, values: {} }

const form = (fields: Record<string, string>) => {
	const data = new FormData()
	for (const [name, value] of Object.entries(fields)) data.set(name, value)
	return data
}

beforeEach(() => {
	mockStore.clear()
})

describe('signup', () => {
	it('succeeds for an email and keeps the email as contact and destination', async () => {
		const state = await signup(PREV, form({
			method: 'email', email: 'ink@example.com', password: 'Hzqmxw1!',
		}))

		expect(state.success).toBe(true)
		expect(state.values.contact).toBe('ink@example.com')
		expect(state.values.destination).toBe('ink@example.com')
		expect(state.formError).toBeUndefined()
	})

	it('formats a phone number to +1… and masks the destination', async () => {
		const state = await signup(PREV, form({ method: 'phone', tel: '(555) 123-4567' }))

		expect(state.success).toBe(true)
		expect(state.values.contact).toBe('+15551234567')
		expect(state.values.destination).toBe('•••-4567')
	})

	it('succeeds for a magic link without a password', async () => {
		const state = await signup(PREV, form({ method: 'magic', email: 'ink@example.com' }))

		expect(state.success).toBe(true)
		expect(state.values.contact).toBe('ink@example.com')
	})

	it('never echoes the password back in values', async () => {
		const state = await signup(PREV, form({
			method: 'email', email: 'ink@example.com', password: 'Hzqmxw1!',
		}))

		expect(state.success).toBe(true)
		expect(Object.keys(state.values)).not.toContain('password')
		expect(JSON.stringify(state)).not.toContain('Hzqmxw1!')

		const failed = await signup(PREV, form({
			method: 'email', email: 'bad', password: 'Hzqmxw1!',
		}))
		expect(failed.success).toBeUndefined()
		expect(JSON.stringify(failed)).not.toContain('Hzqmxw1!')
	})

	it('shows the base error for the failing email', async () => {
		const state = await signup(PREV, form({
			method: 'magic', email: MOCK_INCORRECT.failEmail,
		}))

		expect(state.formError).toBe(BASE_ERROR)
		expect(state.success).toBeUndefined()
	})

	it('shows the base error for the failing phone number', async () => {
		expect(FAIL_CONTACT).toContain(MOCK_INCORRECT.failTel)
		const state = await signup(PREV, form({ method: 'phone', tel: '(000) 000-0000' }))

		expect(state.formError).toBe(BASE_ERROR)
		expect(state.success).toBeUndefined()
	})

	it('turns an invalid hidden method into a form error', async () => {
		const state = await signup(PREV, form({ method: 'carrier-pigeon', email: 'ink@example.com' }))

		expect(state.formError).toBe(BASE_ERROR)
		expect(state.errors.method).toBeDefined()
		expect(state.success).toBeUndefined()
	})

	it('turns a missing method into a form error', async () => {
		const state = await signup(PREV, form({ email: 'ink@example.com' }))

		expect(state.formError).toBe(BASE_ERROR)
	})

	it('keeps a visible field error without a form error', async () => {
		const state = await signup(PREV, form({
			method: 'email', email: 'ink@example.com', password: '',
		}))

		expect(state.errors.password).toBe('Enter a password.')
		expect(state.formError).toBeUndefined()
	})
})

describe('resend', () => {
	it('says another code was sent to the email', async () => {
		const state = await resend(PREV, form({ method: 'email', contact: 'ink@example.com' }))

		expect(state.success).toBe(true)
		expect(state.message).toBe('We sent another code to ink@example.com.')
	})

	it('says another link was sent for the magic method', async () => {
		const state = await resend(PREV, form({ method: 'magic', contact: 'ink@example.com' }))

		expect(state.message).toBe('We sent another link to ink@example.com.')
	})

	it('masks a phone contact in the message', async () => {
		const state = await resend(PREV, form({ method: 'phone', contact: '+15551234567' }))

		expect(state.message).toBe('We sent another code to •••-4567.')
		expect(state.message).not.toContain('5551234567')
	})

	it('shows the base error when the contact is missing', async () => {
		const state = await resend(PREV, form({ method: 'email' }))

		expect(state.formError).toBe(BASE_ERROR)
		expect(state.message).toBeUndefined()
		expect(state.success).toBeUndefined()
	})

	it('shows the base error when the method is invalid', async () => {
		const state = await resend(PREV, form({ method: 'nope', contact: 'ink@example.com' }))

		expect(state.formError).toBe(BASE_ERROR)
	})

	it('shows the base error for the failing resend address', async () => {
		const state = await resend(PREV, form({
			method: 'email', contact: MOCK_INCORRECT.failResend,
		}))

		expect(state.formError).toBe(BASE_ERROR)
		expect(state.message).toBeUndefined()
	})
})

describe('verify', () => {
	const valid = { method: 'email', contact: 'ink@example.com', code: '123456' }

	it('rejects the wrong code on the code field', async () => {
		const state = await verify(PREV, form({ ...valid, code: MOCK_INCORRECT.wrongCode }))

		expect(state.errors.code).toBe(`That code isn't right. Check it and try again.`)
		expect(state.success).toBeUndefined()
		expect(mockStore.has(SESSION)).toBe(false)
	})

	it('reports an expired code as a form error', async () => {
		const state = await verify(PREV, form({ ...valid, code: MOCK_INCORRECT.expiredCode }))

		expect(state.formError).toBe('That code has expired. Resend to get a new one.')
		expect(state.success).toBeUndefined()
		expect(mockStore.has(SESSION)).toBe(false)
	})

	it('rejects a code that is too short without starting a session', async () => {
		const state = await verify(PREV, form({ ...valid, code: '123' }))

		expect(state.errors.code).toBe('Enter the 6-digit code.')
		expect(mockStore.has(SESSION)).toBe(false)
	})

	it('accepts a code typed with spaces', async () => {
		const state = await verify(PREV, form({ ...valid, code: '123 456' }))

		expect(state.success).toBe(true)
	})

	it('starts the session and forgets the remembered account and hint', async () => {
		mockStore.set(REMEMBERED, JSON.stringify({ email: 'old@example.com', name: 'Old' }))
		mockStore.set(HINT, JSON.stringify({ email: 'hint@example.com' }))

		const state = await verify(PREV, form(valid))

		expect(state.success).toBe(true)
		expect(JSON.parse(mockStore.get(SESSION) as string)).toEqual(MOCK_ACCOUNT)
		expect(mockStore.has(REMEMBERED)).toBe(false)
		expect(mockStore.has(HINT)).toBe(false)
	})

	it('shows the base error when the contact is missing, and starts no session', async () => {
		const state = await verify(PREV, form({ method: 'email', code: '123456' }))

		expect(state.formError).toBe(BASE_ERROR)
		expect(state.success).toBeUndefined()
		expect(mockStore.has(SESSION)).toBe(false)
	})

	it('shows the base error when the method is invalid', async () => {
		const state = await verify(PREV, form({ ...valid, method: 'nope' }))

		expect(state.formError).toBe(BASE_ERROR)
		expect(mockStore.has(SESSION)).toBe(false)
	})
})
