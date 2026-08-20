import Link from 'next/link'
import { Children, cloneElement, isValidElement, type ReactNode } from 'react'
import { Box, polymorphic, type BoxProps } from '@/components/core/Box'
import {
	ButtonGroup,
	type ButtonGroupProps, type ButtonGroupSpecs
} from './ButtonGroup'
import {
	ButtonSection,
	type ButtonSectionProps, type ButtonSectionSpecs,
} from './ButtonSection'
import { Icon } from '../Icon'
import { setThemeCSS, type ColorVariable } from '@/lib/theme'
import { useProps, useStyles, useVariantStyles } from '@/hooks'
import type { ComponentPropsWithoutRef, MouseEventHandler, Ref } from 'react'
import type { Route } from 'next'
import classes from './Button.module.scss'

const NAME = 'Button' as const,
	DEFAULT_TAG = 'button' as const

type ButtonSize =
	| 'sm'
	| 'md'
	| 'lg'

type ButtonPriority =
	| 'primary'
	| 'secondary'
	| 'tertiary'

type ButtonVariant =
	| 'dark'
	| 'ghost'
	| 'light'
	| 'outline'
	| 'solid'
	| 'success'
	| 'warning'
	| 'danger'

// type ButtonVars = ColorVariable<typeof NAME>

export type ButtonProps = BoxProps
	& (LinkButtonProps | NativeButtonProps) & {
	children: ReactNode
	disabled?: boolean
	fullWidth?: boolean
	loading?: boolean
	priority?: ButtonPriority
	size?: ButtonSize
	variant?: ButtonVariant
}

interface LinkButtonProps<T extends string = string>
	extends ComponentPropsWithoutRef<'a'> {
	href: Route<T>
	onClick?: never
	ref?: Ref<HTMLAnchorElement>
}

interface NativeButtonProps
	extends ComponentPropsWithoutRef<'button'> {
	href?: never
	onClick?: MouseEventHandler<HTMLButtonElement>
	ref?: Ref<HTMLButtonElement>
}

interface ButtonSpecs {
	default: { component: typeof DEFAULT_TAG }
	props: ButtonProps
	subcomponents: {
		Group: typeof ButtonGroup
		Section: typeof ButtonSection
	}
	// tokens: { root: ButtonVars }
}

type Styles = ReturnType<typeof useStyles<ButtonSpecs>>

const buildSections = (children: ReactNode, styles: Styles) => {
	const label: ReactNode[] = []
	let left: ReactNode = null,
		right: ReactNode = null

	Children.toArray(children).forEach(child => {
		if (isValidElement<ButtonSectionProps>(child) && child.type === ButtonSection) {
			const isLeft = 'left' in child.props && child.props.left,
				taken = isLeft ? left : right

			if (!taken) {
				let clone = cloneElement(child, { parentName: NAME })
				if (isLeft) left = clone
				else right = clone
			} else if (process.env.NODE_ENV !== 'production') {
				console.warn(`${NAME}: multiple ${NAME}.Section[${isLeft ? 'left' : 'right'}] found; only the first is rendered.`)
			}
			return
		}

		label.push(child)
	})

	const innerEl = (
		<Box as="span" { ...styles('label') }>
			{ label }
		</Box>
	)

	if (!left && !right) return innerEl
	return <>{ left }{ innerEl }{ right }</>

}

const getTextFromChildren = (children: ReactNode): string => {
	let text = ''

	Children.toArray(children).forEach(child => {
		if (typeof child === 'string' || typeof child === 'number')
			text += child
		else if (isValidElement<ButtonSectionProps>(child) && child.props?.children)
			text += getTextFromChildren(child.props?.children)
	})

	return text.trim()
}

const tokens = setThemeCSS<ButtonSpecs>((theme, _props) => {
	// const colors = theme.getVariantColors({ theme, ..._props })
	// // const { tokens } = theme
	// console.log({ colors })

	return {
		root: {
			// ...variants,
			// '--button-height': 36px,		// .button__inner height: 0.5 * --button-height
			// '--button-pad': `${tokens.space.inset('sm')} ${tokens.space.inset('lg')}`,
		}
	}
})

export const Button = polymorphic<ButtonSpecs>(_props => {
	useVariantStyles(NAME)
	const props = useProps(NAME, _props)
	const styles = useStyles<ButtonSpecs>(NAME, { classes, props, tokens })

	const {
		as,
		children,
		disabled,
		fullWidth,
		loading,
		priority,
		size,
		variant,
		...rest
	} = props

	const ariaLabel = getTextFromChildren(children),
		aria = { label: !!ariaLabel.length ? false : ariaLabel }

	let data: Record<string, unknown> = {
		variant,
		priority,
		block: !!fullWidth || null,
		loading: !!loading || null,
	}

	const sharedProps = { aria, data, ...styles('root') }
	const inner = (
		<Box as="span" { ...styles('inner') }>
			{ loading && <Icon { ...styles('icon') } size={ 18 } type="loading" /> }
			{ buildSections(children, styles) }
		</Box>
	)

	if ('href' in rest) {
		// narrows `rest` typing (`LinkButtonProps | NativeButtonProps`)
		// by excluding `NativeButtonProps` from `rest`
		// this allows `rest` to be properly typed

		data = { ...data, disabled: !!disabled || null }

		return (
			<Box
				as={ Link }
				{ ...sharedProps }
				{ ...rest as Extract<typeof rest, LinkButtonProps> }
			>
				{ inner }
			</Box>
		)
	}

	return (
		<Box
			as={ as }
			{ ...sharedProps }
			{ ...rest }
		>
			{ inner }
		</Box>
	)
}, classes)

Button.displayName = NAME
Button.Group = ButtonGroup
Button.Section = ButtonSection

Button.setDefaults({
	props: {
		as: DEFAULT_TAG,
		size: 'sm',
		variant: 'solid',
	}
})

export declare namespace Button {
	export type Props = ButtonProps
	export type Specs = ButtonSpecs

	export type Priority = ButtonPriority
	export type Size = ButtonSize
	export type Variant = ButtonVariant

	export namespace Group {
		export type Props = ButtonGroupProps
		export type Specs = ButtonGroupSpecs
	}

	export namespace Section {
		export type Props = ButtonSectionProps
		export type Specs = ButtonSectionSpecs
	}
}
