import { useActionState, useState } from 'react'
import { initFormState, type FormState } from '@/lib/form'
import { login, requestMagicLink, requestReset } from '../_utils/actions'
import type { LoginFlow, LoginStage } from './login.context'

const useOnReply = (state: FormState, onReply: (state: FormState) => void) => {
	const [last, setLast] = useState(state)

	if (state !== last) {
		setLast(state)
		onReply(state)
	}
}

export const useLoginFlow = (): LoginFlow => {
	const [loginState, loginAction, loginPending] = useActionState(login, initFormState)
	const [magicState, magicAction, magicPending] = useActionState(requestMagicLink, initFormState)
	const [resetState, resetAction, resetPending] = useActionState(requestReset, initFormState)

	const [replyFrom, setReplyFrom] = useState<'email' | 'magic'>('email')
	const [resent, setResent] = useState(false)
	const [stage, setStage] = useState<LoginStage>('login')

	useOnReply(loginState, () => setReplyFrom('email'))

	useOnReply(magicState, state => {
		setReplyFrom('magic')
		if (!state.success) return

		setResent(stage === 'magic')
		setStage('magic')
	})

	useOnReply(resetState, state => {
		if (!state.success) return

		setResent(stage === 'reset')
		setStage('reset')
	})

	const handleLoginFlow = (next: LoginStage) => { setStage(next) }

	const sendResetLink = () => {
		setResent(true)
		setTimeout(() => setResent(false), 30000)
	}

	return {
		handleLoginFlow,
		sendResetLink,
		login: { action: loginAction, pending: loginPending, state: loginState },
		magic: { action: magicAction, pending: magicPending, state: magicState },
		reset: { action: resetAction, pending: resetPending, state: resetState },

		formReply: replyFrom === 'magic' ? magicState : loginState,
		resent,
		screen: loginState.success ? 'success' : stage,
	}
}
