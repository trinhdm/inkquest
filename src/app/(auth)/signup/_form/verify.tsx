import { useSignupCtx } from '../_utils/signup.context'
import { validateResend } from '../_utils/schema'
import { AuthForm } from '../../_components/AuthForm'
import { Field } from '@/components/form/Field'

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
		goBack, stopWait,
		destination, idx, method,
		reply, resend, verify, waiting,
	} = useSignupCtx()

	const copy = COPY[method === 'phone' ? 'phone' : 'email']

	return (
		<AuthForm
			action={ verify.action }
			idx={ idx }
			pending={ reply.pending }
			state={ reply.state }
			validate={ validateResend }
		>
			<AuthForm.Header eyebrow="Verify" title={ copy.title }>
				We sent a 6-digit code to { destination }. Enter it below.
			</AuthForm.Header>

			<input name="destination" type="hidden" value={ destination } />
			<input name="method" type="hidden" value={ method } />

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

			<AuthForm.Footer>
				<AuthForm.Back onClick={ goBack } />

				<AuthForm.Submit label="Verify" loading={ verify.pending } />

				<AuthForm.Note>
					<AuthForm.Resend
						data-intent="resend"
						disabled={ waiting }
						formAction={ resend.action }
						idx={ idx }
						loading={ resend.pending }
						onComplete={ stopWait }
						target="code"
					/>

					<AuthForm.Back
						linkable
						disabled={ reply.pending }
						label={ copy.wrong }
						onClick={ goBack }
					/>
				</AuthForm.Note>
			</AuthForm.Footer>
		</AuthForm>
	)
}

SignupVerify.displayName = 'SignupVerify'
