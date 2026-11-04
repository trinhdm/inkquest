import { useState } from 'react'
import { useForm, useFormHistory, useOnReply } from '@/hooks/form'
import { getAuthFormIDs, omitMessage } from '../../_utils/helpers'
import { initFormState } from '@/lib/form'
import { login, magicLogin, requestReset } from './actions'
import { SCREEN_BASE } from './data'
import type { AccountValues } from '@/lib/auth/schema'
import type { FormResults } from '@/lib/form/types'
import type { LoginContext } from './context'
import type { LoginPageData, LoginScreen, ReplyFromStep } from './types'

export const useLoginFlow = (
	{ form, id: pageID }: LoginPageData,
	account: AccountValues | null
): LoginContext => {
	const {
		current: screen,
		back, guard, navigate,
		restart, stopWait, waiting,
	} = useFormHistory<LoginScreen>('start')

	const [replyFrom, setReplyFrom] = useState<ReplyFromStep>(SCREEN_BASE)

	const loginFormState = !!account
		? { ...initFormState, values: { email: account.email } }
		: initFormState

	const loginForm = useForm(login, loginFormState)
	const magicForm = useForm(magicLogin, initFormState)
	const resetForm = useForm(requestReset, initFormState)

	useOnReply(loginForm.state, () => setReplyFrom(SCREEN_BASE))

	useOnReply(magicForm.state, state => {
		setReplyFrom('magic')
		if (state.success) navigate('magic', { wait: true })
	})

	useOnReply(resetForm.state, state => {
		setReplyFrom('reset')
		if (state.success) navigate('reset', { wait: true })
	})

	const replies = {
		start: loginForm,
		magic: magicForm,
		reset: resetForm,
	} satisfies Record<ReplyFromStep, FormResults>

	const replyForm = replies[replyFrom],
		shown: LoginScreen = loginForm.state.success ? 'finish' : screen

	const reply = omitMessage({
		...replyForm,
		pending: loginForm.pending || magicForm.pending,
	})

	return {
		goBack: back,
		guardSubmit: event => guard(event, { when: shown === 'finish' }),
		navigate,
		restart,
		stopWait,

		content: form[shown],

		login: loginForm,
		magic: magicForm,
		reset: screen === 'reset' ? resetForm : omitMessage(resetForm),
		reply,

		destination: screen === 'finish' ? '' : replyForm.state.values.email ?? '',
		idx: getAuthFormIDs(pageID, shown),
		screen: shown,
		waiting,
	}
}
