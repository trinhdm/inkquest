import { useLoginCtx } from '../_utils/login.context'
import { validateLoginForm } from '../_utils/schema'
import { Button } from '@/components/core/Button'
import { Field } from '@/components/form/Field'
import { Form } from '@/components/form/Form'
import { Icon } from '@/components/core/Icon'
import { Section } from '@/components/layout/Section'
import { PLACEHOLDER_EMAIL } from '@/lib/form'

export const LoginRoot = () => {
	const {
		handleLoginFlow,
		formReply: { pending, state },
		idx, login, magic, waiting,
	} = useLoginCtx()

	const ForgotPass = (
		<Button
			unstyled data-link
			onClick={ () => handleLoginFlow('forgot') }
		>
			Forgot password?
		</Button>
	)

	return (
		<Section
			eyebrow="Log In"
			id={ idx.section }
			layout="content-form"
			tabIndex={ -1 }
			title="Welcome back."
		>
			Pick up where you left off.

			<Form
				action={ login.action }
				id={ idx.form }
				pending={ pending }
				state={ state }
				validate={ validateLoginForm }
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

				<Field
					required
					disabled={ pending }
					id={ `${idx.field}-password` }
					label="Password"
					caption={ ForgotPass }
				>
					<Field.Input
						autoComplete="current-password"
						name="password"
						placeholder="Your password"
						type="password"
					/>
				</Field>

				<div className="form__ctas authentication">
					<Button
						fullWidth
						animate="right"
						className="authentication__email"
						disabled={ waiting }
						loading={ login.pending }
						type="submit"
					>
						Log In
						<Button.Section right><Icon type="arrow-right" /></Button.Section>
					</Button>

					<div className="authentication__label" role="presentation">
						<span>or</span>
					</div>

					<Button.Group
						fullWidth
						className="authentication__sso"
						hasPriority={ false }
					>
						<Button
							fullWidth
							onClick={ () => handleLoginFlow('success') }
							variant="outline"
						>
							<Button.Section><Icon type="google" /></Button.Section>
							Log In with Google
						</Button>
						<Button
							fullWidth
							onClick={ () => handleLoginFlow('success') }
							variant="outline"
						>
							<Button.Section><Icon type="apple" /></Button.Section>
							Log In with Apple
						</Button>
					</Button.Group>

					<div className="authentication__magic">
						<Button
							unstyled data-link
							data-intent="magic"
							disabled={ waiting }
							formAction={ magic.action }
							loading={ magic.pending }
							type="submit"
						>
							Email me a magic link instead
						</Button>
					</div>
				</div>
			</Form>
		</Section>
	)
}

LoginRoot.displayName = 'LoginRoot'
