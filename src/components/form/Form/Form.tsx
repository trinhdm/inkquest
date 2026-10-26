import {
	useMemo, useRef,
	type ReactNode,
	type SubmitEvent, type SubmitEventHandler,
} from 'react'

import { extractOthers } from '@/hooks/useProps'
import { polymorphic } from '@/lib/component/factory'
import { Box } from '@/components/polymorphic/Box'
import { FormProvider, type FormContext } from './Form.context'
import { Grid } from '@/components/layout/Grid'
import type { PropsDefaultList } from '@/lib/component/factory/types'
import classes from './Form.module.scss'

const NAME = 'Form' as const,
	TAG = 'form' as const

const DEFAULT_PROPS = {
	as: TAG,
	columns: 1,
	errors: {},
} as const

interface FormProps {
	children: ReactNode
	columns?: Grid.Props['columns']
	errors?: FormContext['errors']
	message?: string
	onSubmit?: SubmitEventHandler<HTMLFormElement>
	pending?: boolean
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

export const Form = polymorphic<FormSpecs>((_props, { useProps, useStyles }) => {
	const ref = useRef<HTMLFormElement>(null)

	const props = useProps(_props)
	const styles = useStyles({ props })

	const {
		children, columns,
		errors, message,
		onSubmit, pending,
		...rest
	} = props

	const others = extractOthers(rest)

	const ctxValues = useMemo(() => ({
		errors,
		pending: !!pending,
	}), [errors, pending])

	const handleSubmit = (event: SubmitEvent<HTMLFormElement>) => {
		if (pending) {
			event.preventDefault()
			return
		}

		onSubmit?.(event)
	}

	return (
		<Box
			{ ...styles('root') }
			{ ...others }
			noValidate
			as={ TAG }
			attributes={ { aria: {
				busy: !!pending || undefined,
			} } }
			onSubmit={ handleSubmit }
			ref={ ref }
		>
			<FormProvider value={ ctxValues }>
				<Grid columns={ columns }>{ children }</Grid>
			</FormProvider>

			<p { ...styles('status') } role="status">
				{ message }
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
