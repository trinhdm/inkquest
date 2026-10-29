import { useSignupCtx } from '../_utils/signup.context'
import { validateVerify } from '../_utils/schema'
import { Button } from '@/components/core/Button'
import { Countdown } from '@/components/data/Countdown'
import { Field } from '@/components/form/Field'
import { Icon } from '@/components/core/Icon'
import { Form } from '@/components/form/Form'
import { Section } from '@/components/layout/Section'

const FORM_ID = 'verify',
	FIELD_ID = `${FORM_ID}-field`,
	TIMER_ID = `${FORM_ID}-timer`

export const SignupVerify = () => {
	const {
		endWait,
		handleSignupFlow,
		pageID, resent, waiting,
		resend, signup,
		method, screen,
		verify: { action, pending, state },
		waitUntilExpiry,
	} = useSignupCtx()

	const { email } = signup.state.values

	return (
		<Section
			eyebrow="Verify Email"
			id={ `${pageID}-${screen}` }
			layout="content-form"
			tabIndex={ -1 }
			title="Check your email"
		>
			<>
				We sent a 6-digit code to { email }. Enter it below.
			</>

			<Form
				action={ action }
				id={ FORM_ID }
				onSubmit={ waitUntilExpiry }
				pending={ pending }
				state={ {
					errors: state.errors,
					formError: state.formError,
					message: resent && waiting ? `We sent another link to ${email}.` : undefined,
				} }
				validate={ validateVerify }
			>
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

				<Field id={ `${FIELD_ID}-code-1` }>
					<Field.Number
						name={ `${FORM_ID}-code-1` }
						inputmode="numeric"
						type="text"
					/>
				</Field>

				<Field id={ `${FIELD_ID}-code-2` }>
					<Field.Number
						name={ `${FORM_ID}-code-2` }
						inputmode="numeric"
						type="text"
					/>
				</Field>

				{/* <input
					type="text"
					inputMode="numeric"
					maxLength={ 1 }
					pattern="\d{6}"
					autoComplete="one-time-code"
					required
				/> */}

				<Button.Group hasPriority={ false }>
					<Button
						animate="left"
						onClick={ () => handleSignupFlow('join') }
						variant="ghost"
					>
						Back
						<Button.Section left><Icon type="arrow-left" /></Button.Section>
					</Button>
					<Button animate="right" loading={ pending } type="submit">
						Verify
						<Button.Section right><Icon type="arrow-right" /></Button.Section>
					</Button>
				</Button.Group>

				<div className="authentication__note">
					<Button
						unstyled data-link
						attributes={ { aria: {
							describedby: waiting ? `${TIMER_ID}-text` : undefined
						} } }
						className="authentication__resend"
						data-intent="resend"
						disabled={ waiting }
						formAction={ resend.action }
						loading={ resend.pending }
						type="submit"
					>
						{ waiting ? 'Resend available in' : 'Resend link' }
						{ waiting && (
							<Countdown
								from={ 30 }
								id={ TIMER_ID }
								onComplete={ endWait }
							/>
						) }
					</Button>

					<span>·</span>

					<Button
						unstyled data-link
						onClick={ () => handleSignupFlow('join') }
					>
						Wrong { method }?
					</Button>
				</div>
			</Form>
		</Section>
	)
}

SignupVerify.displayName = 'SignupVerify'
