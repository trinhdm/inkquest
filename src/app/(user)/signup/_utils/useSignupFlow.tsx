import { useState } from 'react'
import { useForm, useOnReply } from '@/hooks/form'
import { initFormState } from '@/lib/form'
import { magicSignup, signup, verify } from '../_utils/actions'

import type {
	ReplyFromStep,
	SignupFlow, SignupMethod, SignupScreen,
} from './signup.context'

export const useSignupFlow = (): SignupFlow => {
	const [screen, setScreen] = useState<SignupScreen>('join')
	const [replyFrom, setReplyFrom] = useState<ReplyFromStep | null>(null)

	const [method, setMethod] = useState<SignupMethod>('email')
	const [resent, setResent] = useState<boolean>(false)
	const [to, setTo] = useState<string>('')
	const [waiting, setWaiting] = useState(false)

	const signupForm = useForm(signup, initFormState)
	const resendForm = useForm(signup, initFormState)
	const verifyForm = useForm(verify, initFormState)
	const magicForm = useForm(magicSignup, initFormState)

	const waitUntilExpiry: SignupFlow['waitUntilExpiry'] = event => {
		if (waiting || screen === 'success')
			event.preventDefault()
	}

	const goBack = () => {
		setScreen('join')
		setReplyFrom(null)
		setWaiting(false)
	}

	useOnReply(signupForm.state, state => {
		if (!state.success) return
		setReplyFrom(null)
		setScreen(method === 'magic' ? 'inbox' : 'verify')
		setTo(state.values.to)
		setWaiting(true)
	})

	useOnReply(resendForm.state, state => {
		setReplyFrom('resend')
		if (state.success) setWaiting(true)
		setResent(screen === 'verify')
	})

	useOnReply(verifyForm.state, state => {
		setReplyFrom('verify')
		if (state.success) setScreen('success')
	})

	let reply

	switch (replyFrom) {
		case 'resend': reply = resendForm; break
		case 'verify': reply = verifyForm; break
		default: reply = { ...verifyForm, state: initFormState }; break
	}

	return {
		endWait: () => setWaiting(false),
		goBack,
		handleSignupMethod: setMethod,
		waitUntilExpiry,

		signup: signupForm,
		magic: magicForm,
		resend: resendForm,
		verify: verifyForm,

		reply,
		method,
		resent,
		screen,
		to,
		waiting,
	}
}
