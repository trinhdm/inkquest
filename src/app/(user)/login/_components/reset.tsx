import { useLoginCtx } from '../_utils/login.context'
import { Button } from '@/components/core/Button'
import { Field } from '@/components/form/Field'
import { Form } from '@/components/form/Form'
import { Icon } from '@/components/core/Icon'
import { Section } from '@/components/layout/Section'

const FORM_ID = 'reset',
	FIELD_ID = `${FORM_ID}-field`

export const LoginReset = () => {
	const {
		handleLoginFlow,
		pageID, resent, screen,
		reset: { action, pending, state },
		sendResetLink,
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
				onSubmit={ sendResetLink }
				pending={ pending }
				state={ {
					errors: state.errors,
					formError: state.formError,
					message: resent ? `We sent another link to ${email}.` : undefined,
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
					onClick={ () => handleLoginFlow('login') }
				>
					Back to log in
					<Button.Section left><Icon type="arrow-left" /></Button.Section>
				</Button>

				<div className="authentication__note">
					{ resent ? (
						<span>Resend available in</span>
					) : (
						<Button unstyled data-link loading={ pending } type="submit">
							Resend link
						</Button>
					) }
					<span>·</span>
					<Button unstyled data-link onClick={ () => handleLoginFlow('forgot') }>
						Wrong email?
					</Button>
				</div>
			</Form>
		</Section>
	)
}

LoginReset.displayName = 'LoginReset'
