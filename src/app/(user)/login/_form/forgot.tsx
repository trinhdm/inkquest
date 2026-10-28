import { useLoginCtx } from '../_utils/login.context'
import { validateReset } from '../_utils/schema'
import { Button } from '@/components/core/Button'
import { Field } from '@/components/form/Field'
import { Form } from '@/components/form/Form'
import { Icon } from '@/components/core/Icon'
import { Section } from '@/components/layout/Section'
import { PLACEHOLDER_EMAIL } from '@/lib/form'

const FORM_ID = 'forgot',
	FIELD_ID = `${FORM_ID}-field`

export const LoginForgot = () => {
	const {
		handleLoginFlow,
		pageID, screen,
		reset: { action, pending, state },
	} = useLoginCtx()

	return (
		<Section
			eyebrow="Reset password"
			id={ `${pageID}-${screen}` }
			layout="content-form"
			tabIndex={ -1 }
			title="Forgot your password?"
		>
			Enter the email on your account and we&apos;ll send a link to set a new one.

			<Form
				action={ action }
				id={ FORM_ID }
				pending={ pending }
				state={ state }
				validate={ validateReset }
			>
				<Field
					required
					disabled={ pending }
					id={ `${FIELD_ID}-email` }
					label="Email"
				>
					<Field.Input
						autoComplete="email"
						defaultValue={ state.values.email }
						name="email"
						placeholder={ PLACEHOLDER_EMAIL }
						type="email"
					/>
				</Field>

				<Button.Group hasPriority={ false }>
					<Button
						animate="left"
						onClick={ () => handleLoginFlow('email') }
						variant="ghost"
					>
						Back
						<Button.Section left><Icon type="arrow-left" /></Button.Section>
					</Button>
					<Button animate="right" loading={ pending } type="submit">
						Send reset link
						<Button.Section right><Icon type="arrow-right" /></Button.Section>
					</Button>
				</Button.Group>
			</Form>
		</Section>
	)
}

LoginForgot.displayName = 'LoginForgot'
