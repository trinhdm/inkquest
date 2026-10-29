import { useSignupCtx } from '../_utils/signup.context'
import { Button } from '@/components/core/Button'
import { Countdown } from '@/components/data/Countdown'
import { Field } from '@/components/form/Field'
import { Form } from '@/components/form/Form'
import { Icon } from '@/components/core/Icon'
import { Section } from '@/components/layout/Section'

export const SignupMagic = () => {
	const {
		endWait, goBack,
		idx, method, reply, resend,
		resent, to, waiting,
		waitUntilExpiry,
	} = useSignupCtx()

	return (
		<Section
			eyebrow="Magic Link"
			id={ idx.section }
			layout="content-form"
			tabIndex={ -1 }
			title="Check your inbox"
		>
			<>
				We emailed a sign-in link to { to }. It expires in 15 minutes.
			</>

			<Form
				action={ resend.action }
				id={ idx.form }
				onSubmit={ waitUntilExpiry }
				pending={ resend.pending }
				state={ {
					...reply.state,
					message: resent && waiting ? `We sent another link to ${to}.` : undefined,
				} }
			>
				<input name="method" type="hidden" value={ method } />
				<input name="to" type="hidden" value={ to } />

				<Field
					readonly
					id={ `${idx.field}-email` }
					label="Email"
					labelPosition="last"
					layout="inline"
					caption="Didn't arrive? Check spam, or resend below."
				>
					<Field.Input
						defaultValue={ to }
						name="email"
						type="email"
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
						unstyled data-link
						attributes={ { aria: {
							describedby: waiting ? `${idx.timer}-text` : undefined
						} } }
						className="authentication__resend"
						disabled={ waiting }
						loading={ resend.pending }
						type="submit"
					>
						{ waiting ? 'Resend available in' : 'Resend link' }
						{ waiting && (
							<Countdown
								from={ 30 }
								id={ idx.timer }
								onComplete={ endWait }
							/>
						) }
					</Button>
				</Button.Group>
			</Form>
		</Section>
	)
}

SignupMagic.displayName = 'SignupMagic'
