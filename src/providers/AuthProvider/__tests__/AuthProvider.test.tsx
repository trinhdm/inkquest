import { renderHook } from '@testing-library/react'
import { useAuth, AuthProvider } from '../AuthProvider'
import { MOCK_ACCOUNT } from '@/lib/form'
import type { ReactNode } from 'react'

describe('useAuth', () => {
	it('answers "no one is logged in" when there is no provider', () => {
		const { result } = renderHook(() => useAuth())
		expect(result.current).toEqual({ user: null })
	})

	it('does not throw without a provider', () => {
		expect(() => renderHook(() => useAuth())).not.toThrow()
	})
})

describe('AuthProvider', () => {
	const withAuth = (props: Omit<Parameters<typeof AuthProvider>[0], 'children'>) => {
		const Wrapper = ({ children }: { children: ReactNode }) => (
			<AuthProvider { ...props }>{ children }</AuthProvider>
		)
		return Wrapper
	}

	it('shares the user with components below it', () => {
		const { result } = renderHook(() => useAuth(), { wrapper: withAuth({ user: MOCK_ACCOUNT }) })
		expect(result.current.user).toEqual(MOCK_ACCOUNT)
	})

	it('shares the logout function', () => {
		const logout = jest.fn()
		const { result } = renderHook(() => useAuth(), { wrapper: withAuth({ logout, user: MOCK_ACCOUNT }) })

		expect(result.current.logout).toBe(logout)
	})

	it('treats a null user as logged out', () => {
		const { result } = renderHook(() => useAuth(), { wrapper: withAuth({ user: null }) })
		expect(result.current.user).toBeNull()
	})

	it('leaves logout undefined when none is given', () => {
		const { result } = renderHook(() => useAuth(), { wrapper: withAuth({ user: null }) })
		expect(result.current.logout).toBeUndefined()
	})
})
