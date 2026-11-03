import { useSignupCtx } from '../_utils/signup.context'
import { Button } from '@/components/core/Button'
import { Icon } from '@/components/core/Icon'
import { METHOD_DATA } from '../_utils/signup.data'

export const AuthOptions = () => {
	const {
		handleSignup, signup,
		method: { inactive: otherMethods },
	} = useSignupCtx()

	return otherMethods.map(name => {
		const { toggle: { icon, label } } = METHOD_DATA[name]

		return (
			<Button
				unstyled
				className="authentication__option"
				disabled={ signup.pending }
				key={ `${name}-option` }
				onClick={ () => handleSignup(name) }
			>
				<Button.Section><Icon size="14" type={ icon } /></Button.Section>
				<span data-link>{ label }</span>
			</Button>
		)
	})
}

AuthOptions.displayName = 'AuthOptions'
