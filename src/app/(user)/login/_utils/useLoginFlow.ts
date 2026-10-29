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
	const [screen, setScreen] = useState<LoginScreen>('begin')
	const [replyFrom, setReplyFrom] = useState<ReplyFromScreen>('begin')
	const [waiting, setWaiting] = useState(false)

	const loginForm = useForm(login, initFormState)
	const magicForm = useForm(magicLogin, initFormState)
	const resetForm = useForm(requestReset, initFormState)

	const formReply = replyFrom === 'magic' ? magicForm : loginForm
	const shown = loginForm.state.success ? 'success' : screen

	const resetEmail = screen === 'forgot' || screen === 'reset'
		? resetForm.state.values.email
		: undefined

	const handleLoginFlow = (next: LoginScreen) => {
		setWaiting(false)
		setScreen(next)
	}

	const handleScreen = (next: SendLinkScreen) => {
		setWaiting(true)
		setScreen(next)
	}

	const waitUntilExpiry: LoginFlow['waitUntilExpiry'] = event => {
		if (waiting || shown === 'success')
			event.preventDefault()
	}

	useOnReply(loginForm.state, () => setReplyFrom('begin'))

	useOnReply(magicForm.state, state => {
		setReplyFrom('magic')
		if (state.success) handleScreen('magic')
	})

	useOnReply(resetForm.state, state => {
		if (state.success) handleScreen('reset')
	})

	return {
		endWait: () => setWaiting(false),
		handleLoginFlow,
		waitUntilExpiry,

		login: loginForm,
		magic: magicForm,
		reset: resetForm,

		formReply: {
			...formReply,
			pending: loginForm.pending || magicForm.pending,
		},
		destination: resetEmail ?? formReply.state.values.email ?? '',
		idx: getAuthFormIDs(pageID, screen),
		screen: shown,
		waiting,
	}
}
