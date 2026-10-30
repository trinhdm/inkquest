import { useState } from 'react'
import { useForm, useFormHistory, useOnReply } from '@/hooks/form'
import { getAuthFormIDs } from '../../_utils/helpers'
import { initFormState } from '@/lib/form'
import { login, magicLogin, requestReset } from '../_utils/actions'
import type { LoginFlow, LoginScreen, ReplyFromScreen } from './login.context'
import type { LoginPageData } from './login.data'

export const useLoginFlow = ({ id: pageID }: LoginPageData): LoginFlow => {
	const {
		current: screen,
		back, guard, navigate,
		restart, stopWait, waiting,
	} = useFormHistory<LoginScreen>('begin')

	const [replyFrom, setReplyFrom] = useState<ReplyFromScreen>('begin')

	const loginForm = useForm(login, initFormState)
	const magicForm = useForm(magicLogin, initFormState)
	const resetForm = useForm(requestReset, initFormState)

	const reply = replyFrom === 'magic' ? magicForm : loginForm,
		shown = loginForm.state.success ? 'success' : screen

	const resetEmail = screen === 'forgot' || screen === 'reset'
		? resetForm.state.values.email
		: undefined

	useOnReply(loginForm.state, () => setReplyFrom('begin'))

	useOnReply(magicForm.state, state => {
		setReplyFrom('magic')
		if (state.success) navigate('magic', { wait: true })
	})

	useOnReply(resetForm.state, state => {
		if (state.success) navigate('reset', { wait: true })
	})

	return {
		goBack: back,
		guardSubmit: event => guard(event, { when: shown === 'success' }),
		navigate,
		restart,
		stopWait,

		login: loginForm,
		magic: magicForm,
		reset: resetForm,

		reply: {
			...reply,
			pending: loginForm.pending || magicForm.pending,
		},
		destination: resetEmail ?? reply.state.values.email ?? '',
		idx: getAuthFormIDs(pageID, shown),
		screen: shown,
		waiting,
	}
}
