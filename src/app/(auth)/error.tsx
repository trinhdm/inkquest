'use client'

import { ErrorScreen } from '@/components/templates/ErrorScreen'

interface AuthErrorProps
	extends Pick<ErrorScreen.Props, 'error' | 'reset'> {}

//	catches anything the auth pages throw that isn't a form reply
export default function AuthError(props: AuthErrorProps) {
	return <ErrorScreen { ...props } />
}
