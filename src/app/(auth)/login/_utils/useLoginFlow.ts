import { useState } from 'react'
import { useForm, useFormHistory, useOnReply } from '@/hooks/form'
import { getAuthFormIDs, omitMessage } from '../../_utils/helpers'
import { initFormState, type FormResults } from '@/lib/form'
import { login, magicLogin, requestReset } from './actions'
import type { LoginFlow, LoginScreen, ReplyFromStep } from './login.context'
import type { LoginPageData } from './login.data'
import type { RememberedAccount } from '../../_utils/account'

export const useLoginFlow = (
	{ id: pageID }: LoginPageData,
	account: RememberedAccount | null
): LoginFlow => {
	const {
		current: screen,
		back, guard, navigate,
		restart, stopWait, waiting,
	} = useFormHistory<LoginScreen>('begin')

	const [replyFrom, setReplyFrom] = useState<ReplyFromStep>('begin')

	const loginFormState = !!account
		? { ...initFormState, values: { email: account.email } }
		: initFormState

	const loginForm = useForm(login, loginFormState)
	const magicForm = useForm(magicLogin, initFormState)
	const resetForm = useForm(requestReset, initFormState)

	useOnReply(loginForm.state, () => setReplyFrom('begin'))

	useOnReply(magicForm.state, state => {
		setReplyFrom('magic')
		if (state.success) navigate('magic', { wait: true })
	})

	useOnReply(resetForm.state, state => {
		setReplyFrom('reset')
		if (state.success) navigate('reset', { wait: true })
	})

	const replies = {
		begin: loginForm,
		magic: magicForm,
		reset: resetForm,
	} satisfies Record<ReplyFromStep, FormResults>

	const replyForm = replies[replyFrom],
		shown = loginForm.state.success ? 'success' : screen

	const reply = omitMessage({
		...replyForm,
		pending: loginForm.pending || magicForm.pending,
	})

	return {
		goBack: back,
		guardSubmit: event => guard(event, { when: shown === 'success' }),
		navigate,
		restart,
		stopWait,

		login: loginForm,
		magic: magicForm,
		reset: screen === 'reset' ? resetForm : omitMessage(resetForm),
		reply,

		destination: screen === 'success' ? '' : replyForm.state.values.email ?? '',
		idx: getAuthFormIDs(pageID, shown),
		screen: shown,
		waiting,
	}
}
