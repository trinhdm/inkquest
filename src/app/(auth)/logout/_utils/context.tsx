import { createPageCtx } from '@/lib/page/context'
import type { AuthFormData, AuthFormIDs } from '../../_utils/types'
import type { LogoutFormValues } from './types'

export interface LogoutContext
	extends LogoutFormValues {
	content: AuthFormData
	idx: AuthFormIDs
}

export const {
	PageProvider: LogoutProvider,
	usePageCtx: useLogoutCtx,
} = createPageCtx<LogoutContext>('logout')
