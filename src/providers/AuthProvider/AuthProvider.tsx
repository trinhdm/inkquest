'use client'

import { use, useMemo, type ReactNode } from 'react'
import { AuthContext, type AuthValue } from './auth.context'

interface AuthProviderProps
	extends AuthValue {
	children?: ReactNode
}

export const useAuth = () =>
	use(AuthContext)

export const AuthProvider = ({
	children,
	logout,
	user,
}: AuthProviderProps) => {
	const value = useMemo(() => ({ logout, user }), [logout, user])
	return <AuthContext value={ value }>{ children }</AuthContext>
}
