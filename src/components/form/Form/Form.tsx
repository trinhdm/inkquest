import {
	useEffect, useMemo,
	useRef, useState,
	type ChangeEvent, type ChangeEventHandler,
	type ReactNode,
	type SubmitEvent, type SubmitEventHandler,
} from 'react'

import { CircleAlert, CircleCheck } from 'lucide-react'
import { extractOthers } from '@/hooks/useProps'
import { polymorphic } from '@/lib/component/factory'
import { Box } from '@/components/polymorphic/Box'
import { FormProvider, type FormContext } from './Form.context'
import { Grid } from '@/components/layout/Grid'
import type { FormState } from '@/lib/form/types'
import type { PropsDefaultList } from '@/lib/component/factory/types'
import classes from './Form.module.scss'

const NAME = 'Form' as const,
	TAG = 'form' as const

const DEFAULT_PROPS = {
	as: TAG,
	columns: 1,
	feedback: 'lazy',
	mountFocus: true,
	shiftFocus: true,
	state: {
		errors: {},
		formError: undefined,
		message: undefined,
	},
} as const

const DISABLED = ':disabled',
	HIDDEN = '[type="hidden"]',
	READONLY = '[readonly]'

const FIRST_CONTROL = [
	`input:not(${DISABLED}, ${READONLY}, ${HIDDEN})`,
	`select:not(${DISABLED})`,
	`textarea:not(${DISABLED}, ${READONLY})`,
].join(', ')

const INVALID_CONTROL = '[aria-invalid="true"]'

const NO_ERRORS: FormContext['errors'] = {}

interface FormProps {
	children: ReactNode
	columns?: Grid.Props['columns']
	feedback?: 'eager' | 'lazy'
	mountFocus?: boolean
	onChange?: ChangeEventHandler<HTMLFormElement>
	onSubmit?: SubmitEventHandler<HTMLFormElement>
	pending?: boolean
	pendingMessage?: string
	shiftFocus?: boolean
	state?: Pick<FormState, 'errors' | 'formError' | 'message'>
	validate?: (data: FormData) => FormContext['errors']
}

interface FormSpecs {
	defaults: {
		as: typeof TAG
		props: PropsDefaultList<typeof DEFAULT_PROPS>
	}
	props: FormProps
	selectors: FormSelectors
}

type FormSelectors =
	| 'root' | 'status' | 'message'

type FieldElement =
	| HTMLInputElement
	| HTMLSelectElement
	| HTMLTextAreaElement

interface LocalErrors {
	errors: FormContext['errors']
	from: FormContext['errors'] | undefined
}

const hasErrors = (errors: FormContext['errors']) =>
	Object.values(errors).some(Boolean)

const isField = (target: EventTarget): target is FieldElement =>
	target instanceof HTMLInputElement
	|| target instanceof HTMLSelectElement
	|| target instanceof HTMLTextAreaElement

export const Form = polymorphic<FormSpecs>((_props, { useProps, useStyles }) => {
	const [attempt, setAttempt] = useState(0)
	const [local, setLocal] = useState<LocalErrors | null>(null)

	const ref = useRef<HTMLFormElement>(null)

	const props = useProps(_props)
	const styles = useStyles({ props })

	const {
		children, columns, feedback,
		mountFocus, onChange, onSubmit,
		pending, pendingMessage, shiftFocus,
		state: { errors, formError, message },
		validate,
		...rest
	} = props

	const others = extractOthers(rest)
	const isLocal = local !== null && local.from === errors,
		shown = (isLocal ? local.errors : errors) ?? NO_ERRORS

	const ctxValues = useMemo(() => ({
		errors: shown,
		pending: !!pending,
	}), [pending, shown])

	useEffect(() => {
		//	focuses the first control every time this form mounts
		if (!mountFocus || !ref.current) return
		ref.current.querySelector<HTMLElement>(FIRST_CONTROL)?.focus()
	}, [mountFocus])

	useEffect(() => {
		//	moves focus to the first invalid control whenever errors change
		if (!shiftFocus || !ref.current) return
		ref.current.querySelector<HTMLElement>(INVALID_CONTROL)?.focus()
	}, [attempt, errors, shiftFocus])

	const handleChange = (event: ChangeEvent<HTMLFormElement>) => {
		onChange?.(event)

		const data = new FormData(event.currentTarget),
			field: EventTarget = event.target,
			name = isField(field) ? field.name : undefined,
			current = name ? shown[name] : undefined

		if (!name || !current || !validate) return

		const next = validate(data)[name]
		if (next === current) return

		const fieldErr = { eager: next, lazy: undefined }[feedback]
		setLocal({ errors: { ...shown, [name]: fieldErr }, from: errors })
	}

	const handleSubmit = (event: SubmitEvent<HTMLFormElement>) => {
		if (pending) {
			event.preventDefault()
			return
		}

		setAttempt(count => count + 1)

		if (validate) {
			const data = new FormData(event.currentTarget),
				{ submitter } = event.nativeEvent

			//	data-attrs can be used to name a check to run on submit
			if (submitter?.dataset.intent)
				data.set('intent', submitter.dataset.intent)

			const found = validate(data)
			setLocal({ errors: found, from: errors })

			if (hasErrors(found)) {
				event.preventDefault()
				return
			}
		}

		onSubmit?.(event)
	}

	const reply = isLocal ? {} : { formError, message }
	const text = pending ? pendingMessage
		: reply.formError ?? reply.message
	const kind = pending ? undefined
		: reply.formError ? 'error'
			: reply.message ? 'success'
				: undefined
	const keyKind = kind ? `${kind}-${attempt}` : ''

	return (
		<Box
			{ ...styles('root') }
			{ ...others }
			noValidate
			as={ TAG }
			attributes={ { aria: {
				busy: !!pending || undefined,
			} } }
			onChange={ handleChange }
			onSubmit={ handleSubmit }
			ref={ ref }
		>
			<FormProvider value={ ctxValues }>
				<Grid columns={ columns }>{ children }</Grid>
			</FormProvider>

			<p { ...styles('status') } role="status">
				{ !!text && (
					<span { ...styles('message') } data-kind={ kind } key={ attempt }>
						{ kind === 'error' && <CircleAlert key={ keyKind} /> }
						{ kind === 'success' && <CircleCheck key={ keyKind } /> }
						{ text }
					</span>
				) }
			</p>
		</Box>
	)
}, { name: NAME, classes })

Form.set({
	defaultProps: DEFAULT_PROPS,
	displayName: NAME,
})

export declare namespace Form {
	export type Context = FormContext
	export type Props = FormProps
	export type Specs = FormSpecs

	export type Errors = FormContext['errors']
}
