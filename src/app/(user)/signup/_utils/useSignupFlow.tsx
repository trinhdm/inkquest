import { useState } from 'react'
import { useForm, useOnReply } from '@/hooks/form'
import { getAuthFormIDs } from '../../_utils/helpers'
import { initFormState } from '@/lib/form'
import { resend, signup, verify } from '../_utils/actions'
import type { SignupPageData } from './signup.data'

import type {
	ReplyFromStep,
	SignupFlow, SignupMethod, SignupScreen,
} from './signup.context'

export const useSignupFlow = ({ id: pageID }: SignupPageData): SignupFlow => {
	const [screen, setScreen] = useState<SignupScreen>('join')
	const [replyFrom, setReplyFrom] = useState<ReplyFromStep | null>(null)

	const [method, setMethod] = useState<SignupMethod>('email')
	const [resent, setResent] = useState<boolean>(false)
	const [waiting, setWaiting] = useState(false)

	const signupForm = useForm(signup, initFormState)
	const resendForm = useForm(resend, initFormState)
	const verifyForm = useForm(verify, initFormState)

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

	let reply = {
		...verifyForm,
		pending: verifyForm.pending || resendForm.pending,
		state: initFormState,
	}

	switch (replyFrom) {
		case 'resend': reply = resendForm; break
		case 'verify': reply = verifyForm; break
	}

	return {
		endWait: () => setWaiting(false),
		goBack,
		handleSignupMethod: setMethod,
		waitUntilExpiry,

		signup: signupForm,
		resend: resendForm,
		verify: verifyForm,

		idx: getAuthFormIDs(pageID, screen),
		to: signupForm.state.values.to ?? '',
		method,
		reply,
		resent,
		screen,
		waiting,
	}
}
