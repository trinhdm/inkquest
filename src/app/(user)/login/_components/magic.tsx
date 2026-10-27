import { useLoginCtx } from '../_utils/login.context'
import { validateReset } from '../_utils/schema'
import { Button } from '@/components/core/Button'
import { Countdown } from '@/components/data/Countdown'
import { Field } from '@/components/form/Field'
import { Form } from '@/components/form/Form'
import { Icon } from '@/components/core/Icon'
import { Section } from '@/components/layout/Section'

const FORM_ID = 'forgot-pw',
	FIELD_ID = `${FORM_ID}-field`

export const LoginMagic = () => {
	const {
		endWait,
		handleLoginFlow,
		magic: { action, pending, state },
		pageID, screen, waiting,
		waitUntilExpiry,
	} = useLoginCtx()

	const { email } = state.values

	return (
		<Section
			eyebrow="Magic Link"
			id={ `${pageID}-${screen}` }
			layout="content-form"
			tabIndex={ -1 }
			title="Check your inbox"
		>
			<>
				We emailed a sign-in link to { email }. It expires in 15 minutes.
			</>

			<Form
				action={ action }
				id={ FORM_ID }
				onSubmit={ waitUntilExpiry }
				pending={ pending }
				state={ state }
				validate={ validateReset }
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

				<Button.Group hasPriority={ false }>
					<Button
						animate="left"
						onClick={ () => handleLoginFlow('email') }
						variant="ghost"
					>
						Back
						<Button.Section left><Icon type="arrow-left" /></Button.Section>
					</Button>

					<Button
						unstyled data-link
						className="authentication__resend"
						disabled={ waiting }
						loading={ pending }
						type="submit"
					>
						{ waiting ? 'Resend available in' : 'Resend link' }
						{ waiting && <Countdown from={ 30 } onComplete={ endWait } /> }
					</Button>
				</Button.Group>
			</Form>
		</Section>
	)
}

LoginMagic.displayName = 'LoginMagic'
