import { createPageCtx } from '@/lib/page/context'
import type { AuthFormIDs } from '../../_utils/types'
import type { FormResults } from '@/lib/form/types'
import type { LogoutFormData, LogoutFormValues } from './types'

export interface LogoutContext
	extends LogoutFormValues {
	content: LogoutFormData
	idx: AuthFormIDs
	logout: FormResults
}

export const {
	PageProvider: LogoutProvider,
	usePageCtx: useLogoutCtx,
} = createPageCtx<LogoutContext>('logout')
