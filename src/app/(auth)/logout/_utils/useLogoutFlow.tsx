import { useForm } from '@/hooks/form'
import { getAuthFormIDs } from '../../_utils/helpers'
import { initFormState } from '@/lib/form'
import { logout } from '@/lib/auth/actions'
import type { LogoutFlow } from './context'
import type { LogoutFormValues, LogoutPageData } from './types'

export const useLogoutFlow = (
	data: LogoutPageData,
	args: LogoutFormValues,
): LogoutFlow => {
	const { account, screen } = args
	const { id: pageID } = data

	const logoutInitState = { ...initFormState, values: account },
		logoutForm = useForm(logout, logoutInitState)

	return {
		account,
		idx: getAuthFormIDs(pageID, screen),
		logout: logoutForm,
		screen,
	}
}
