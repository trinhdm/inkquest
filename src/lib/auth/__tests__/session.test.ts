/**
 * @jest-environment node
 */

// The mock session. A real backend replaces startSession, getSession and
// endSession, so these tests pin what callers rely on: getSession returns the
// account or null, and signIn leaves no "Continue as" state behind.
import { endSession, getSession, signIn, startSession } from '../session'

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

const SESSION = 'inkq_session',
	REMEMBERED = 'inkq_last_account',
	HINT = 'inkq_login_hint'

const ACCOUNT = { email: 'ada@example.com', name: 'Ada Lovelace' },
	OTHER = { email: 'grace@example.com', name: 'Grace Hopper' }

const seed = (name: string, value: unknown) =>
	mockStore.set(name, { value: JSON.stringify(value) })

beforeEach(() => mockStore.clear())

describe('startSession / getSession / endSession', () => {
	it('round-trips the account through a 7-day httpOnly cookie', async () => {
		await startSession(ACCOUNT)

		await expect(getSession()).resolves.toEqual(ACCOUNT)
		expect(mockStore.get(SESSION)?.options).toMatchObject({ httpOnly: true, maxAge: 60 * 60 * 24 * 7 })
	})

	it('returns null for a missing or malformed session', async () => {
		await expect(getSession()).resolves.toBeNull()

		mockStore.set(SESSION, { value: '{not json' })
		await expect(getSession()).resolves.toBeNull()
	})

	it('endSession deletes only the session', async () => {
		seed(SESSION, ACCOUNT)
		seed(REMEMBERED, OTHER)
		await endSession()

		expect([...mockStore.keys()]).toEqual([REMEMBERED])
	})
})

describe('signIn', () => {
	it('starts a session and clears the remembered account and hint', async () => {
		seed(REMEMBERED, OTHER)
		seed(HINT, OTHER)
		await signIn(ACCOUNT)

		expect([...mockStore.keys()]).toEqual([SESSION])
		await expect(getSession()).resolves.toEqual(ACCOUNT)
	})
})
