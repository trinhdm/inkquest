import { useSignupCtx } from '../_utils/context'
import { Button } from '@/components/core/Button'
import { Icon } from '@/components/core/Icon'
import { METHOD_DATA } from '../_utils/data'

export const AuthOptions = () => {
	const {
		method: { inactive: otherMethods },
		selectMethod, signup,
	} = useSignupCtx()

	return (
		<div
			aria-label="Other ways to sign up"
			className="authentication__options"
			role="group"
		>
			{ otherMethods.map(name => {
				const { toggle: { icon, label } } = METHOD_DATA[name]

				return (
					<Button
						unstyled
						className="authentication__option"
						disabled={ signup.pending }
						key={ `${name}-option` }
						onClick={ () => selectMethod(name) }
					>
						<Button.Section><Icon size="14" type={ icon } /></Button.Section>
						<span data-link>{ label }</span>
					</Button>
				)
			}) }
		</div>
	)
}

AuthOptions.displayName = 'AuthOptions'
