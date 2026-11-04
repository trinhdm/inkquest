import { Button } from '@/components/core/Button'
import { Field } from '@/components/form/Field'
import { Form } from '@/components/form/Form'
import { Grid } from '@/components/layout/Grid'
import { PLACEHOLDER } from '@/lib/form'
import type { FormResults } from '@/lib/form/types'
import type { SupportTopic } from '../_utils/types'

interface SupportFormProps
	extends FormResults {
	id: string
	topics: readonly SupportTopic[]
}

export const SupportForm = ({
	action,
	id,
	pending,
	state,
	topics,
}: SupportFormProps) => {
	const fieldID = `${id}-field`,
		topic = state.values.topic ?? topics[0].value

	const itemProps = { as: Grid.Item, required: true },
		thinProps = { ...itemProps, span: 1 },
		wideProps = { ...itemProps, span: 2 }

	return (
		<Form
			action={ action }
			columns={ 2 }
			id={ id }
			pending={ pending }
			state={ state }
		>
			<Field.Group
				{ ...wideProps }
				className="form-choices"
				id={ `${id}-choices` }
				labelPosition="last"
				layout="button"
				legend="What's it about?"
			>
				{ topics.map(({ value, ...option }) => (
					<Field
						{ ...option }
						id={ `${fieldID}-choice-${value}` }
						key={ value }
					>
						<Field.Choice
							defaultChecked={ topic === value }
							name="topic"
							value={ value }
						/>
					</Field>
				)) }
			</Field.Group>

			<Field
				{ ...thinProps }
				id={ `${fieldID}-name` }
				label="Name"
			>
				<Field.Input
					autoComplete="name"
					defaultValue={ state.values.name }
					name="name"
					placeholder={ PLACEHOLDER.name }
				/>
			</Field>

			<Field
				{ ...thinProps }
				id={ `${fieldID}-email` }
				label="Email"
			>
				<Field.Input
					autoComplete="email"
					defaultValue={ state.values.email }
					name="email"
					placeholder={ PLACEHOLDER.email }
					type="email"
				/>
			</Field>

			<Field
				{ ...wideProps }
				id={ `${fieldID}-message` }
				label="Message"
			>
				<Field.Textarea
					defaultValue={ state.values.message }
					name="message"
					placeholder="What's going on?"
				/>
			</Field>

			<Field
				{ ...wideProps }
				id={ `${fieldID}-screenshots` }
				label="Screenshots"
				required={ false }
			>
				<Field.Textarea
					defaultValue={ state.values.screenshots }
					name="screenshots"
				/>
			</Field>

			<Button loading={ pending } type="submit">
				Send Message
			</Button>
		</Form>
	)
}

SupportForm.displayName = 'SupportForm'
