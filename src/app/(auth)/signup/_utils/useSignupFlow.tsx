import { useState } from 'react'
import { useForm, useFormHistory, useOnReply } from '@/hooks/form'
import { getAuthFormIDs } from '../../_utils/helpers'
import { initFormState, type FormResults } from '@/lib/form'
import { resend, signup, verify } from './actions'
import { METHOD_BASE, SIGNUP_METHODS } from './data'
import type { SignupFlow } from './context'

import type {
	ReplyFromStep, SignupMethod,
	SignupPageData, SignupScreen,
} from './types'

export const useSignupFlow = ({ id: pageID }: SignupPageData): SignupFlow => {
	const {
		current: screen,
		back, guard, navigate,
		startWait, stopWait, waiting,
	} = useFormHistory<SignupScreen>('begin')

	const [replyFrom, setReplyFrom] = useState<ReplyFromStep | null>(null)
	const [order, setOrder] = useState<SignupMethod[]>(() => [
		METHOD_BASE,
		...SIGNUP_METHODS.filter(name => name !== METHOD_BASE),
	])

	const [method, ...otherMethods] = order

	const signupForm = useForm(signup, initFormState)
	const resendForm = useForm(resend, initFormState)
	const verifyForm = useForm(verify, initFormState)

	const handleSignup = (next: SignupMethod) =>
		setOrder(prev => {
			const [current, ...others] = prev
			if (next === current) return prev
			return [next, ...others.filter(name => name !== next), current]
		})

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

	const replies = {
		resend: resendForm,
		verify: verifyForm,
	} satisfies Record<ReplyFromStep, FormResults>

	const reply = {
		...verifyForm,
		pending: verifyForm.pending || resendForm.pending,
		state: replyFrom ? replies[replyFrom].state : initFormState,
	}

	return {
		goBack: back,
		guardSubmit: event => guard(event, { when: screen === 'success' }),
		handleSignup,
		navigate,
		stopWait,

		signup: signupForm,
		resend: resendForm,
		verify: verifyForm,

		destination: signupForm.state.values.destination ?? '',
		idx: getAuthFormIDs(pageID, screen),
		method: {
			active: method,
			inactive: otherMethods,
		},
		reply,
		screen,
		waiting,
	}
}
