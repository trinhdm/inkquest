import { useSignupCtx } from '../_utils/signup.context'
import { validateVerify } from '../_utils/schema'
import { AuthForm } from '../../_components/AuthForm'
import { Button } from '@/components/core/Button'
import { Field } from '@/components/form/Field'
import { Icon } from '@/components/core/Icon'
import { ResendTimer } from '../../_components/ResendTimer'

const COPY = {
	email: {
		// eyebrow: 'Verify Email',
		// sent: 'We emailed a 6-digit code to',
		title: 'Check your email',
		wrong: 'Wrong email?',
	},
	phone: {
		// eyebrow: 'Verify Phone',
		// sent: 'We texted a 6-digit code to',
		title: 'Check your texts',
		wrong: 'Wrong number?',
	},
} as const

export const SignupVerify = () => {
	const {
		endWait, goBack,
		idx, method, reply,
		resend, resent, to,
		verify, waiting,
		waitUntilExpiry,
	} = useSignupCtx()

	const copy = COPY[method === 'phone' ? 'phone' : 'email']

	const authFormProps = {
		form: {
			action: verify.action,
			onSubmit: waitUntilExpiry,
			pending: reply.pending,
			state: {
				...reply.state,
				message: resent && waiting ? `We sent another link to ${to}.` : undefined,
			},
			validate: validateVerify,
		},
		header: {
			title: copy.title,
			eyebrow: 'Verify',
			description: <>We sent a 6-digit code to { to }. Enter it below.</>,
		},
		idx,
	} satisfies Omit<AuthForm.Props, 'children'>

	return (
		<AuthForm { ...authFormProps }>
			<input name="method" type="hidden" value={ method } />
			<input name="to" type="hidden" value={ to } />

			{/* <Field.Group layout="keypad" legend="">
				<Field id={ `${FIELD_ID}-code-1` } label="1">
					<Field.Number
						name={ `${FORM_ID}-code-1` }
						inputmode="numeric"
						type="text"
					/>
				</Field>

				<Field id={ `${FIELD_ID}-code-2` } label="2">
					<Field.Number
						name={ `${FORM_ID}-code-2` }
						inputmode="numeric"
						type="text"
					/>
				</Field>

				<Field id={ `${FIELD_ID}-code-3` } label="3">
					<Field.Number
						name={ `${FORM_ID}-code-3` }
						inputmode="numeric"
						type="text"
					/>
				</Field>

				<Field id={ `${FIELD_ID}-code-4` } label="4">
					<Field.Number
						name={ `${FORM_ID}-code-4` }
						inputmode="numeric"
						type="text"
					/>
				</Field>

				<Field id={ `${FIELD_ID}-code-5` } label="5">
					<Field.Number
						name={ `${FORM_ID}-code-5` }
						inputmode="numeric"
						type="text"
					/>
				</Field>

				<Field id={ `${FIELD_ID}-code-6` } label="6">
					<Field.Number
						name={ `${FORM_ID}-code-6` }
						inputmode="numeric"
						type="text"
					/>
				</Field>
			</Field.Group> */}

			<Field
				required
				disabled={ verify.pending }
				id={ `${idx.field}-code` }
				label="6-digit code"
			>
				<Field.Number
					autoComplete="one-time-code"
					inputmode="numeric"
					maxLength={ 6 }
					name="code"
					placeholder="123456"
					type="text"
				/>
			</Field>

			<Button.Group hasPriority={ false }>
				<Button
					animate="left"
					onClick={ goBack }
					variant="ghost"
				>
					Back
					<Button.Section left><Icon type="arrow-left" /></Button.Section>
				</Button>
				<Button
					animate="right"
					disabled={ waiting }
					loading={ verify.pending }
					type="submit"
				>
					Verify
					<Button.Section right><Icon type="arrow-right" /></Button.Section>
				</Button>
			</Button.Group>

			<div className="authentication__note">
				<ResendTimer
					data-intent="resend"
					formAction={ resend.action }
					idx={ idx }
					loading={ resend.pending }
					onClick={ waitUntilExpiry }
					onComplete={ endWait }
					waiting={ waiting }
				/>

				<span data-dot>·</span>

				<Button unstyled data-link onClick={ goBack }>
					{ copy.wrong }
				</Button>
			</div>
		</AuthForm>
	)
}

SignupVerify.displayName = 'SignupVerify'
