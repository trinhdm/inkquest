/**
 * @jest-environment node
 */

// The app-wide auth actions. Every export of this 'use server' file is a public
// endpoint, so each one only ever touches the caller's own cookies. cookies() is an
// in-memory store, and redirect() throws the way Next's does, so code after it
// never runs.
import { redirect } from 'next/navigation'
import { clearAccount, logout } from '../actions'

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

describe('logout', () => {
	it('remembers the session account, ends the session and opens /logout', async () => {
		seed(SESSION, ACCOUNT)

		await expect(logout()).rejects.toThrow('NEXT_REDIRECT /logout')
		expect(mockStore.has(SESSION)).toBe(false)
		expect(stored(REMEMBERED)).toEqual(ACCOUNT)
		expect(redirect).toHaveBeenCalledWith('/logout')
	})

	it('clears a hint left by an earlier "Continue as"', async () => {
		seed(SESSION, ACCOUNT)
		seed(HINT, OTHER)

		await expect(logout()).rejects.toThrow('NEXT_REDIRECT')
		expect(mockStore.has(HINT)).toBe(false)
	})

	it('remembers nothing when there is no session', async () => {
		await expect(logout()).rejects.toThrow('NEXT_REDIRECT /logout')
		expect(mockStore.size).toBe(0)
	})
})

describe('clearAccount', () => {
	it('deletes the hint and the remembered account without redirecting', async () => {
		seed(REMEMBERED, OTHER)
		seed(HINT, ACCOUNT)

		await expect(clearAccount()).resolves.toBeUndefined()
		expect(mockStore.size).toBe(0)
		expect(redirect).not.toHaveBeenCalled()
	})

	it('leaves the session alone', async () => {
		seed(SESSION, ACCOUNT)
		seed(HINT, ACCOUNT)
		await clearAccount()

		expect(stored(SESSION)).toEqual(ACCOUNT)
	})
})
