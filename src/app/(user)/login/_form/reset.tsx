import { useLoginCtx } from '../_utils/login.context'
import { Button } from '@/components/core/Button'
import { Countdown } from '@/components/data/Countdown'
import { Field } from '@/components/form/Field'
import { Form } from '@/components/form/Form'
import { Icon } from '@/components/core/Icon'
import { Section } from '@/components/layout/Section'

const FORM_ID = 'reset',
	FIELD_ID = `${FORM_ID}-field`,
	TIMER_ID = `${FORM_ID}-timer`

export const LoginReset = () => {
	const {
		endWait,
		handleLoginFlow,
		pageID, resent, screen, waiting,
		reset: { action, pending, state },
		waitUntilExpiry,
	} = useLoginCtx()

	const { email } = state.values

	return (
		<Section
			eyebrow="Check your inbox"
			id={ `${pageID}-${screen}` }
			layout="content-form"
			tabIndex={ -1 }
			title="Reset link sent"
		>
			<>
				If an account exists for { email }, a link to reset your password is on its way. It expires in 30 minutes.
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
			>
				<Field
					readonly
					id={ `${FIELD_ID}-email` }
					label="Email"
					labelPosition="last"
					layout="inline"
					caption="Didn't arrive? Check spam, or resend below."
				>
					<Field.Input
						defaultValue={ email }
						name="email"
						type="email"
					/>
				</Field>

				<Button
					animate="left"
					onClick={ () => handleLoginFlow('email') }
				>
					Back to log in
					<Button.Section left><Icon type="arrow-left" /></Button.Section>
				</Button>

				<div className="authentication__note">
					<Button
						unstyled data-link
						attributes={ { aria: {
							describedby: waiting ? `${TIMER_ID}-text` : undefined
						} } }
						className="authentication__resend"
						disabled={ waiting }
						loading={ pending }
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

					<span data-dot>·</span>

					<Button
						unstyled data-link
						onClick={ () => handleLoginFlow('forgot') }
					>
						Wrong email?
					</Button>
				</div>
			</Form>
		</Section>
	)
}

LoginReset.displayName = 'LoginReset'
