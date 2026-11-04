import { Field } from '@/components/form/Field'
import type { AuthFormIDs } from '../_utils/types'

const SENDER_CAPTION_BASE = `Didn't arrive? Check spam, or resend below.`

interface SenderFieldProps {
	caption?: string | null
	email: string
	idx: AuthFormIDs
}

export const SenderField = ({
	caption = SENDER_CAPTION_BASE,
	email,
	idx,
}: SenderFieldProps) => {
	return (
		<Field
			readonly
			id={ `${idx.field}-email` }
			label="Email"
			labelPosition="last"
			layout="inline"
			caption={ caption }
		>
			<Field.Input
				defaultValue={ email }
				name="email"
				type="email"
			/>
		</Field>
	)
}

SenderField.displayName = 'SenderField'
