import { useSignupCtx } from '../_utils/context'
import { Field } from '@/components/form/Field'

interface HiddenFieldsProps {
	contact?: boolean
	destination?: boolean
	method?: boolean
}

export const HiddenFields = ({
	contact: hasContact,
	destination: hasDestination,
	method: hasMethod,
}: HiddenFieldsProps) => {
	const {
		contact, destination,
		method: { active: method },
	} = useSignupCtx()

	return (
		<>
			{ !!hasContact && <Field.Hidden name="contact" value={ contact } /> }
			{ !!hasDestination && <Field.Hidden name="destination" value={ destination } /> }
			{ !!hasMethod && <Field.Hidden name="method" value={ method } /> }
		</>
	)
}

HiddenFields.displayName = 'HiddenFields'
