import { useState} from 'react'
import { useForm, useOnReply } from '@/hooks/form'
import { initFormState } from '@/lib/form'
import { magicSignup, signup, verify } from '../_utils/actions'

import type {
	SignupFlow, SignupScreen,
	ReplyFromScreen, SendLinkScreen,
} from './signup.context'

export const useSignupFlow = (): SignupFlow => {
	const [screen, setScreen] = useState<SignupScreen>('join')
	const [replyFrom, setReplyFrom] = useState<ReplyFromScreen>('join')
	const [resent, setResent] = useState<boolean>(false)
	const [waiting, setWaiting] = useState(false)

	const signupForm = useForm(signup, initFormState)
	const resendForm = useForm(signup, initFormState)
	const magicForm = useForm(magicSignup, initFormState)
	const verifyForm = useForm(verify, initFormState)

	const waitUntilExpiry: SignupFlow['waitUntilExpiry'] = event => {
		if (waiting || screen === 'success')
			event.preventDefault()
	}

	const handleScreen = (next: SendLinkScreen) => {
		setWaiting(true)
		setResent(screen === next)
		setScreen(next)
	}

	useOnReply(signupForm.state, state => {
		setReplyFrom('join')
		if (!state.success) return
		handleScreen('verify')
	})

	useOnReply(magicForm.state, state => {
		// setReplyFrom('magic')
		if (!state.success) return
		handleScreen('magic')
	})

	return {
		endWait: () => setWaiting(false),
		handleSignupFlow: setScreen,
		waitUntilExpiry,

		signup: signupForm,
		magic: magicForm,
		resend: resendForm,
		verify: verifyForm,

		verifyReply: replyFrom === 'verify' ? resendForm : verifyForm,
		// screen: signupForm.state.success ? 'success' : screen,
		screen,
		resent,
		waiting,
	}
}
