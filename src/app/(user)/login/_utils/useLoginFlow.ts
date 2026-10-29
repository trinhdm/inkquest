import { useState} from 'react'
import { useForm, useOnReply } from '@/hooks/form'
import { getAuthFormIDs } from '../../_utils/helpers'
import { initFormState } from '@/lib/form'
import { login, magicLogin, requestReset } from '../_utils/actions'
import type { LoginPageData } from './login.data'

import type {
	LoginFlow, LoginScreen,
	ReplyFromScreen, SendLinkScreen,
} from './login.context'

export const useLoginFlow = ({ id: pageID }: LoginPageData): LoginFlow => {
	const [screen, setScreen] = useState<LoginScreen>('email')
	const [replyFrom, setReplyFrom] = useState<ReplyFromScreen>('email')
	const [resent, setResent] = useState<boolean>(false)
	const [waiting, setWaiting] = useState(false)

	const loginForm = useForm(login, initFormState)
	const magicForm = useForm(magicLogin, initFormState)
	const resetForm = useForm(requestReset, initFormState)

	const waitUntilExpiry: LoginFlow['waitUntilExpiry'] = event => {
		if (waiting || screen === 'success')
			event.preventDefault()
	}

	const handleScreen = (next: SendLinkScreen) => {
		setWaiting(true)
		setResent(screen === next)
		setScreen(next)
	}

	useOnReply(loginForm.state, () => setReplyFrom('email'))

	useOnReply(magicForm.state, state => {
		setReplyFrom('magic')
		if (state.success) handleScreen('magic')
	})

	useOnReply(resetForm.state, state => {
		if (state.success) handleScreen('reset')
	})

	return {
		endWait: () => setWaiting(false),
		handleLoginFlow: setScreen,
		waitUntilExpiry,

		login: loginForm,
		magic: magicForm,
		reset: resetForm,

		formReply: {
			...(replyFrom === 'magic' ? magicForm : loginForm),
			pending: loginForm.pending || magicForm.pending,
		},
		idx: getAuthFormIDs(pageID, screen),
		screen: loginForm.state.success ? 'success' : screen,
		resent,
		waiting,
	}
}
