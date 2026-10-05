import {
	isValidElement,
	useId, useMemo,
	type ReactNode,
} from 'react'

import {
	Calendar, Calendar1, CalendarDays,
	Clock, Globe, Hash, LoaderCircle,
	Mail, Paperclip, Phone, Pipette, Search,
} from 'lucide-react'

import { extractOthers } from '@/hooks/useProps'
import { defineTokens, filterChildren, polymorphic, verifyChildren } from '@/lib/component'
import { toKebabCase } from '@/utils/helpers'
import { Box } from '@/components/polymorphic/Box'
import { FieldProvider, type FieldContext } from './Field.context'
import { TextInput } from '../TextInput'
import type { PropsDefaultList } from '@/lib/component/factory/types'
import type { Size } from '@/types/shared'
import type { StyleFn } from '@/hooks/useStyles'
import classes from './Field.module.scss'

const NAME = 'Field' as const,
	TAG = 'div' as const

const DEFAULT_PROPS = {
	as: TAG,
	required: false,
	size: 'md',
} as const

const SUBCOMPONENTS = {
	// FileUpload: FileUpload,
	// TextArea: TextArea,
	Input: TextInput,
} as const

interface FieldProps {
	children: ReactNode
	disabled?: boolean
	error?: string
	id: string
	label?: string
	loading?: boolean
	required?: boolean
	size?: Size
}

interface FieldSpecs {
	defaults: {
		as: typeof TAG
		props: PropsDefaultList<typeof DEFAULT_PROPS>
	}
	props: FieldProps
	selectors: FieldSelectors
	subcomponents: typeof SUBCOMPONENTS
	tokens: FieldTokens
}

type FieldSelectors =
	| 'root' | 'label' | 'control'
	| 'required' | 'icon' | 'indicator' | 'error'

type FieldTokens = {
	root:
		| '--field-control-padding'
}

interface FieldParts {
	control: ReactNode | null
	icon: ReactNode | null
	label: ReactNode  | null
}

const getIcon = (type?: TextInput.Props['type']) => {
	switch (type) {
		case 'color':	return <Pipette />
		case 'date':	return <Calendar />
		case 'email':	return <Mail />
		case 'file':	return <Paperclip />
		case 'month':	return <Calendar1 />
		case 'number':	return <Hash />
		case 'search':	return <Search />
		case 'tel':		return <Phone />
		case 'time':	return <Clock />
		case 'url':		return <Globe />
		case 'week':	return <CalendarDays />
		default:		return null
	}
}

const buildField = (
	children: FieldProps['children'],
	styles: StyleFn<FieldSpecs>,
): FieldParts => {
	const childNames = [TextInput.displayName]
	const [control] = filterChildren(children, childNames)

	verifyChildren({ children, name: NAME, total: 1 })

	const items = {
		control,
		icon: null,
		label: null,
	} as FieldParts

	if (isValidElement<TextInput.Props>(control)) {
		const { props: { type } } = control
		const icon = getIcon(type)

		if (icon) items.icon = <div { ...styles('icon') }>{ icon }</div>
	}

	return items
}

const tokens = defineTokens<FieldSpecs>()(({ props, theme }) => {
	const { size } = props

	const step = size === 'sm' ? 2 : 1.25
	const blockPadding = 'var(--field-padding-block)',
		inlinePadding = `calc(${step} * ${blockPadding})`

	return {
		root: {
			'--field-control-padding': !!size ? theme.el.field.padding(size) : undefined,
			'--field-padding-block': !!size ? theme.el.field.padding(size) : undefined,
			'--field-padding-inline': !!size ? inlinePadding : undefined,
			'--field-icon-size': !!size ? `calc(${theme.el.icon.size(size)} - .125rem)` : undefined,
		},
	}
})

export const Field = polymorphic<FieldSpecs>((_props, { useProps, useStyles }) => {
	const props = useProps(_props)
	const styles = useStyles({ props, tokens })

	const {
		as,
		children,
		disabled,
		error,
		id,
		label,
		loading,
		required,
		size,
		unstyled,
		...rest
	} = props

	const others = extractOthers(rest)
	const hasError = !!error?.trim()
	const { control, icon } = buildField(children, styles)

	const uid = useId()
	const idx = useMemo(() => {
		const root = toKebabCase(id ?? uid),
			control = `${root}-control`,
			error = `${root}-error`
		return { control, error }
	}, [id, uid])

	const ctxValues = useMemo(() => ({
		disabled, loading, required,
		hasError, hasIcon: icon !== null,
		idx, size, unstyled,
	}), [
		disabled, loading, required,
		hasError, unstyled,
		icon, idx, size,
	])

	const clsx = {
		module: { [`${size}`]: size },
	}

	const data = {
		disabled: !!disabled || null,
		invalid: hasError || null,
		loading: !!loading || null,
	}

	return (
		<Box
			{ ...styles('root', clsx) }
			{ ...others }
			as={ as }
			attributes={ { data } }
		>
			{ !!label && (
				<label { ...styles('label') } htmlFor={ idx.control }>
					{ label }
					{ required && <span { ...styles('required') } aria-hidden="true">*</span> }
				</label>
			) }

			<FieldProvider value={ ctxValues }>
				<div { ...styles('control') }>
					{ icon }{ control }
					{ !!loading && <Box { ...styles('indicator') } as={ LoaderCircle } /> }
				</div>
			</FieldProvider>

			{ hasError && <p { ...styles('error') }>{ error }</p> }
		</Box>
	)
}, { name: NAME, classes })

Field.set({
	defaultProps: DEFAULT_PROPS,
	displayName: NAME,
	subcomponents: SUBCOMPONENTS,
})

export declare namespace Field {
	export type Context = FieldContext
	export type Props = FieldProps
	export type Specs = FieldSpecs
}
