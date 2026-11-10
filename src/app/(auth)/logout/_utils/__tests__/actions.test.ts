/**
 * @jest-environment node
 */

// The two /logout page actions, plus the whole hand-off from `logout` to /login,
// because they pass the same two cookies to each other. cookies() is an in-memory
// store, and redirect() throws the way Next's does, so code after it never runs.
import { redirect } from 'next/navigation'
import { clearAccount, logout } from '@/lib/auth/actions'
import { swapAccount, transferAccount } from '../actions'

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

const SESSION = 'inkq_session',
	REMEMBERED = 'inkq_last_account',
	HINT = 'inkq_login_hint'

const ACCOUNT = { email: 'ada@example.com', name: 'Ada Lovelace' },
	OTHER = { email: 'grace@example.com', name: 'Grace Hopper' }

const seed = (name: string, value: unknown) =>
	mockStore.set(name, JSON.stringify(value))

const stored = (name: string) => {
	const value = mockStore.get(name)
	return value && JSON.parse(value)
}

beforeEach(() => {
	mockStore.clear()
	jest.mocked(redirect).mockClear()
})

describe('transferAccount ("Continue as")', () => {
	it('hands the remembered account to /login and replaces /logout in history', async () => {
		seed(REMEMBERED, ACCOUNT)

		await expect(transferAccount()).rejects.toThrow('NEXT_REDIRECT /login')
		expect(mockStore.has(REMEMBERED)).toBe(false)
		expect(stored(HINT)).toEqual(ACCOUNT)
		expect(redirect).toHaveBeenCalledWith('/login', 'replace')
	})

	// the buttons are disabled while this runs; this is why
	it('blanks the hint when run a second time', async () => {
		seed(REMEMBERED, ACCOUNT)

		await expect(transferAccount()).rejects.toThrow()
		await expect(transferAccount()).rejects.toThrow()
		expect(mockStore.size).toBe(0)
	})
})

describe('swapAccount ("Use a different account")', () => {
	it('forgets both cookies and replaces /logout with a blank /login', async () => {
		seed(REMEMBERED, ACCOUNT)
		seed(HINT, OTHER)

		await expect(swapAccount()).rejects.toThrow('NEXT_REDIRECT /login')
		expect(mockStore.size).toBe(0)
		expect(redirect).toHaveBeenCalledWith('/login', 'replace')
	})
})

describe('the full hand-off', () => {
	it('lets only "Continue as" carry the account to /login', async () => {
		seed(SESSION, ACCOUNT)
		await expect(logout()).rejects.toThrow()
		await expect(transferAccount()).rejects.toThrow()
		expect(stored(HINT)).toEqual(ACCOUNT)

		seed(SESSION, ACCOUNT)
		await expect(logout()).rejects.toThrow()
		await expect(swapAccount()).rejects.toThrow()
		expect(mockStore.has(HINT)).toBe(false)
	})

	it('leaves nothing behind once /login has shown the hint', async () => {
		seed(SESSION, ACCOUNT)
		await expect(logout()).rejects.toThrow()
		await expect(transferAccount()).rejects.toThrow()
		await clearAccount()

		expect(mockStore.size).toBe(0)
	})
})
