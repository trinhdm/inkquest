import { useState} from 'react'
import { useForm, useOnReply } from '@/hooks/form'
import { initFormState } from '@/lib/form'
import { magicSignup, signup, verify } from '../_utils/actions'

import type {
	SignupFlow, SignupScreen,
	ReplyFromScreen, SendLinkScreen,
	SignupMethod,
	VerifyFromScreen,
} from './signup.context'

export const useSignupFlow = (): SignupFlow => {
	const [screen, setScreen] = useState<SignupScreen>('join')
	const [replyFrom, setReplyFrom] = useState<ReplyFromScreen>('join')
	const [verifyFrom, setVerifyFrom] = useState<VerifyFromScreen>('join')

	const [resent, setResent] = useState<boolean>(false)
	const [waiting, setWaiting] = useState(false)
	const [method, setMethod] = useState<SignupMethod>('email')

	const signupForm = useForm(signup, initFormState)
	const magicForm = useForm(magicSignup, initFormState)
	const resendForm = useForm(signup, initFormState)
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
		setReplyFrom('magic')
		if (!state.success) return
		handleScreen('magic')
	})

	return {
		endWait: () => setWaiting(false),
		handleSignupFlow: setScreen,
		handleSignupMethod: setMethod,
		waitUntilExpiry,

		signup: signupForm,
		magic: magicForm,
		resend: resendForm,
		verify: verifyForm,

		formReply: replyFrom === 'magic' ? magicForm : signupForm,
		verifyReply: verifyFrom === 'verify' ? resendForm : verifyForm,
		// screen: signupForm.state.success ? 'success' : screen,
		method,
		screen,
		resent,
		waiting,
	}
}
