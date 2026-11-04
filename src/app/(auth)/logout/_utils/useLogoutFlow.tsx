import { getAuthFormIDs } from '../../_utils/helpers'
import type { LogoutContext } from './context'
import type { LogoutFormValues, LogoutPageData } from './types'

export const useLogoutFlow = (
	data: LogoutPageData,
	args: LogoutFormValues,
): LogoutContext => {
	const { account, screen } = args
	const { form, id: pageID } = data

	return {
		account,
		content: form[screen],
		idx: getAuthFormIDs(pageID, screen),
		screen,
	}
}
