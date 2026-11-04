import { useParser } from '@/hooks/useParser'
import { useSignupCtx } from '../_utils/context'
import { AuthForm } from '../../_components/AuthForm'
import { Field } from '@/components/form/Field'
import { NavRoutes } from '@/utils/navigation'
import { METHOD_DATA } from '../_utils/data'

export const FinishSignup = () => {
	const {
		content, destination, guardSubmit, idx,
		method: { active: method },
	} = useSignupCtx()

	const note = useParser(content.footer)
	const { field: { label, type } } = METHOD_DATA[method]

	return (
		<AuthForm idx={ idx } onSubmit={ guardSubmit }>
			<AuthForm.Header eyebrow={ content.eyebrow } title={ content.heading }>
				{ content.body }
			</AuthForm.Header>

			{ !!destination && (
				<Field
					readonly
					id={ `${idx.field}-to` }
					label={ label }
					layout="inline"
				>
					<Field.Input
						defaultValue={ destination }
						name={ type }
						type={ type }
					/>
				</Field>
			) }

			<AuthForm.Footer>
				<AuthForm.Continue href={ NavRoutes.USER_ONBOARDING } label="Start setup" />

				{ !!note && (
					<AuthForm.Note>
						<p>{ note }</p>
					</AuthForm.Note>
				) }
			</AuthForm.Footer>
		</AuthForm>
	)
}

FinishSignup.displayName = 'FinishSignup'
