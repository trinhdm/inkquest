import { useLoginCtx } from '../_utils/login.context'
import { Button } from '@/components/core/Button'
import { Field } from '@/components/form/Field'
import { Form } from '@/components/form/Form'
import { Icon } from '@/components/core/Icon'
import { Section } from '@/components/layout/Section'

const FORM_ID = 'login-success',
	FIELD_ID = `${FORM_ID}-field`

export const LoginSuccess = () => {
	const {
		login: { state },
		pageID, screen,
	} = useLoginCtx()

	const { email } = state.values

	return (
		<Section
			eyebrow="Success!"
			id={ `${pageID}-${screen}` }
			layout="content-form"
			tabIndex={ -1 }
			title="Logged in."
		>
			Welcome back — your feed is where you left it.

			<Form id={ FORM_ID }>
				<Field
					readonly
					id={ `${FIELD_ID}-email` }
					label="Email"
					layout="inline"
				>
					<Field.Input
						defaultValue={ email }
						name="email"
						type="email"
					/>
				</Field>

				<Button animate="right" href="/community/feed">
					Go to your feed
					<Button.Section right><Icon type="arrow-right" /></Button.Section>
				</Button>
			</Form>
		</Section>
	)
}

LoginSuccess.displayName = 'LoginSuccess'
