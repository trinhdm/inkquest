import { createContext } from 'react'
import type { RequireSome } from '@/types/utils'
import type { UserData } from '@/types/shared'

export type AuthUser =
	RequireSome<Partial<UserData>, 'email'>

export interface AuthValue {
	logout?: () => Promise<void>
	user: AuthUser | null
}

export const AuthContext = createContext<AuthValue>({ user: null })
