import { useForm } from '@/hooks/form'
import { getAuthFormIDs } from '../../_utils/helpers'
import { initFormState } from '@/lib/form'
import { logout } from '@/lib/auth/actions'
import type { LogoutContext } from './context'
import type { LogoutFormValues, LogoutPageData } from './types'

export const useLogoutFlow = (
	data: LogoutPageData,
	args: LogoutFormValues,
): LogoutContext => {
	const { account, screen } = args
	const { form, id: pageID } = data

	const logoutInitState = { ...initFormState, values: account },
		logoutForm = useForm(logout, logoutInitState)

	return {
		account,
		content: form[screen],
		idx: getAuthFormIDs(pageID, screen),
		logout: logoutForm,
		screen,
	}
}
