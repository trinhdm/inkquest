import { createPageCtx } from '@/lib/page/context'
import type { AuthFormIDs } from '../../_utils/types'
import type { FormResults } from '@/lib/form/types'
import type { LogoutFormValues, LogoutPageData } from './types'

export interface LogoutFlow
	extends LogoutFormValues {
	idx: AuthFormIDs
	logout: FormResults
}

export interface LogoutContext
	extends LogoutFlow {
	data: LogoutPageData
}

export const {
	PageProvider: LogoutProvider,
	usePageCtx: useLogoutCtx,
} = createPageCtx<LogoutContext>('logout')
