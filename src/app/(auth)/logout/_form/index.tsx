'use client'

import { useScreenFocus } from '@/hooks/form/useScreenFocus'
import { useLogoutFlow } from '../_utils/useLogoutFlow'
import { ConfirmLogout } from '../_form/ConfirmLogout'
import { FinishLogout } from '../_form/FinishLogout'
import { LogoutProvider } from '../_utils/context'
import { LOGOUT_PAGE_DATA } from '../_utils/data'
import type { ComponentType } from 'react'
import type { LogoutFormValues, LogoutScreen } from '../_utils/types'

const SCREENS = {
	confirm:	ConfirmLogout,
	finish:		FinishLogout,
} satisfies Record<LogoutScreen, ComponentType>

export const LogoutForm = (props: LogoutFormValues) => {
	const { idx, screen, ...flow } = useLogoutFlow(LOGOUT_PAGE_DATA, props)
	useScreenFocus(screen, idx.section)

	const Screen = SCREENS[screen],
		ctxValues = { data: LOGOUT_PAGE_DATA, idx, screen, ...flow }

	return (
		<LogoutProvider value={ ctxValues }>
			<Screen />
		</LogoutProvider>
	)
}

LogoutForm.displayName = 'LogoutForm'
