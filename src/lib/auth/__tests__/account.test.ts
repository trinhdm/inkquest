/**
 * @jest-environment node
 */

// next/headers only works inside a request, so cookies() is swapped for an
// in-memory store. Like Next inside a Server Action, a cookie set or deleted
// earlier in the same call is what a later get() sees.
import {
	forgetAccount, handoverAccount, recallAccount,
	rememberAccount, suggestAccount,
} from '../account'

const mockStore = new Map<string, { value: string, options?: Record<string, unknown> }>()

jest.mock('next/headers', () => ({
	cookies: async () => ({
		get: (name: string) => {
			const cookie = mockStore.get(name)
			return cookie && { name, value: cookie.value }
		},
		set: (name: string, value: string, options?: Record<string, unknown>) => {
			mockStore.set(name, { value, options })
		},
		delete: (name: string) => {
			mockStore.delete(name)
		},
	}),
}))

const REMEMBERED = 'inkq_last_account',
	HINT = 'inkq_login_hint'

const ACCOUNT = { email: 'ada@example.com', name: 'Ada Lovelace' },
	OTHER = { email: 'grace@example.com', name: 'Grace Hopper' }

const seed = (name: string, value: unknown) =>
	mockStore.set(name, { value: JSON.stringify(value) })

const stored = (name: string) => {
	const cookie = mockStore.get(name)
	return cookie && JSON.parse(cookie.value)
}

beforeEach(() => mockStore.clear())

describe('rememberAccount', () => {
	it('writes the account to the remembered cookie for 10 minutes', async () => {
		await rememberAccount(ACCOUNT)

		expect(stored(REMEMBERED)).toEqual(ACCOUNT)
		expect(mockStore.get(REMEMBERED)?.options).toEqual({
			httpOnly: true,
			maxAge: 600,
			sameSite: 'lax',
			secure: false,
		})
	})

	it('clears an older hint, so a new logout starts clean', async () => {
		seed(HINT, OTHER)
		await rememberAccount(ACCOUNT)

		expect(mockStore.has(HINT)).toBe(false)
	})
})

describe('recallAccount', () => {
	it('reads the remembered account', async () => {
		seed(REMEMBERED, ACCOUNT)
		await expect(recallAccount()).resolves.toEqual(ACCOUNT)
	})

	it('returns null when nothing is remembered', async () => {
		await expect(recallAccount()).resolves.toBeNull()
	})

	it('returns null for a cookie that is not JSON', async () => {
		mockStore.set(REMEMBERED, { value: '{not json' })
		await expect(recallAccount()).resolves.toBeNull()
	})

	it('returns null for JSON that fails the account schema', async () => {
		seed(REMEMBERED, { email: 'not-an-email' })
		await expect(recallAccount()).resolves.toBeNull()
	})
})

describe('forgetAccount', () => {
	it('deletes both the remembered account and the hint', async () => {
		seed(REMEMBERED, ACCOUNT)
		seed(HINT, OTHER)
		await forgetAccount()

		expect(mockStore.size).toBe(0)
	})
})

describe('handoverAccount', () => {
	it('moves the remembered account into the hint for 60 seconds', async () => {
		seed(REMEMBERED, ACCOUNT)
		await handoverAccount()

		expect(mockStore.has(REMEMBERED)).toBe(false)
		expect(stored(HINT)).toEqual(ACCOUNT)
		expect(mockStore.get(HINT)?.options).toMatchObject({ httpOnly: true, maxAge: 60 })
	})

	it('replaces an older hint with the remembered account', async () => {
		seed(REMEMBERED, ACCOUNT)
		seed(HINT, OTHER)
		await handoverAccount()

		expect(stored(HINT)).toEqual(ACCOUNT)
	})

	it('writes no hint, and clears an old one, when nothing is remembered', async () => {
		seed(HINT, OTHER)
		await handoverAccount()

		expect(mockStore.size).toBe(0)
	})
})

describe('suggestAccount', () => {
	it('reads the hint, not the remembered account', async () => {
		seed(REMEMBERED, OTHER)
		seed(HINT, ACCOUNT)

		await expect(suggestAccount()).resolves.toEqual(ACCOUNT)
	})

	it('returns null when there is no hint', async () => {
		seed(REMEMBERED, ACCOUNT)
		await expect(suggestAccount()).resolves.toBeNull()
	})
})
