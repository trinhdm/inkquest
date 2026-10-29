import { useLoginCtx } from '../_utils/login.context'
import { validateReset } from '../_utils/schema'
import { Button } from '@/components/core/Button'
import { Field } from '@/components/form/Field'
import { Form } from '@/components/form/Form'
import { Icon } from '@/components/core/Icon'
import { Section } from '@/components/layout/Section'
import { PLACEHOLDER_EMAIL } from '@/lib/form'

export const LoginForgot = () => {
	const {
		handleLoginFlow, idx,
		reset: { action, pending, state },
	} = useLoginCtx()

	return (
		<Section
			eyebrow="Reset password"
			id={ idx.section }
			layout="content-form"
			tabIndex={ -1 }
			title="Forgot your password?"
		>
			Enter the email on your account and we&apos;ll send a link to set a new one.

			<Form
				action={ action }
				id={ idx.form }
				pending={ pending }
				state={ state }
				validate={ validateReset }
			>
				<Field
					required
					disabled={ pending }
					id={ `${idx.field}-email` }
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
