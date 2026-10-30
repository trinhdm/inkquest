import { useState } from 'react'
import { useForm, useFormHistory, useOnReply } from '@/hooks/form'
import { getAuthFormIDs } from '../../_utils/helpers'
import { initFormState } from '@/lib/form'
import { resend, signup, verify } from '../_utils/actions'
import type { SignupPageData } from './signup.data'

import type {
	ReplyFromStep,
	SignupFlow, SignupMethod, SignupScreen,
} from './signup.context'

export const useSignupFlow = ({ id: pageID }: SignupPageData): SignupFlow => {
	const {
		current: screen,
		back, guard, navigate,
		startWait, stopWait, waiting,
	} = useFormHistory<SignupScreen>('begin')

	const [method, setMethod] = useState<SignupMethod>('email')
	const [replyFrom, setReplyFrom] = useState<ReplyFromStep | null>(null)

	const signupForm = useForm(signup, initFormState)
	const resendForm = useForm(resend, initFormState)
	const verifyForm = useForm(verify, initFormState)

	useOnReply(signupForm.state, state => {
		if (!state.success) return
		setReplyFrom(null)
		navigate(method === 'magic' ? 'inbox' : 'verify', { wait: true })
	})

	useOnReply(resendForm.state, state => {
		setReplyFrom('resend')
		if (state.success) startWait()
	})

	useOnReply(verifyForm.state, state => {
		setReplyFrom('verify')
		if (state.success) navigate('success')
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
		goBack: back,
		guardSubmit: event => guard(event, { when: screen === 'success' }),
		handleSignup: setMethod,
		stopWait,

		signup: signupForm,
		resend: resendForm,
		verify: verifyForm,

		destination: signupForm.state.values.destination ?? '',
		idx: getAuthFormIDs(pageID, screen),
		method,
		reply,
		screen,
		waiting,
	}
}
