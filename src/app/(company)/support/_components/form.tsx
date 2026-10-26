import {
	useActionState, useState,
	type SubmitEvent,
} from 'react'

import {
	initFormState, showMessage,
	PLACEHOLDER_EMAIL, type FormState,
} from '@/lib/form'

import { Button } from '@/components/core/Button'
import { Field } from '@/components/form/Field'
import { Form } from '@/components/form/Form'
import { Grid } from '@/components/layout/Grid'
import type { z } from 'zod'
import type { SupportTopic } from '../_utils/types'

interface SupportFormProps {
	action: (prev: FormState, data: FormData) => Promise<FormState>
	id: string
	schema: z.ZodType
	topics: readonly SupportTopic[]
}

export const SupportForm = ({
	action,
	id,
	schema,
	topics,
}: SupportFormProps) => {
	const [state, formAction, pending] = useActionState(action, initFormState)
	const [clientErrors, setClientErrors] = useState<FormState['errors'] | null>(null)

	const checkForm = (event: SubmitEvent<HTMLFormElement>) => {
		const result = schema.safeParse(Object.fromEntries(new FormData(event.currentTarget)))
		if (result.success) return setClientErrors(null)

		event.preventDefault()
		setClientErrors(showMessage(result.error))
	}

	const failedCheck = clientErrors !== null
	const fieldID = `${id}-field`,
		topic = state.values.topic ?? topics[0].value

	return (
		<Form
			action={ formAction }
			columns={ 2 }
			errors={ clientErrors ?? state.errors }
			formError={ failedCheck ? undefined : state.formError }
			id={ id }
			message={ failedCheck ? undefined : state.message }
			onSubmit={ checkForm }
			pending={ pending }
			pendingMessage="Sending..."
		>
			<Field.Group
				required
				as={ Grid.Item }
				className="form-choices"
				id={ `${id}-choices` }
				labelPosition="last"
				layout="button"
				legend="What's it about?"
				span={ 2 }
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
				required
				as={ Grid.Item }
				id={ `${fieldID}-name` }
				label="Name"
				span={ 1 }
			>
				<Field.Input
					autoComplete="name"
					defaultValue={ state.values.name }
					name="name"
					placeholder="John Doe"
				/>
			</Field>

			<Field
				required
				as={ Grid.Item }
				id={ `${fieldID}-email` }
				label="Email"
				span={ 1 }
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
				as={ Grid.Item }
				id={ `${fieldID}-message` }
				label="Message"
				span={ 2 }
			>
				<Field.Textarea
					defaultValue={ state.values.message }
					name="message"
					placeholder="What's going on?"
				/>
			</Field>

			<Field
				as={ Grid.Item }
				id={ `${fieldID}-screenshots` }
				label="Screenshots"
				span={ 2 }
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
