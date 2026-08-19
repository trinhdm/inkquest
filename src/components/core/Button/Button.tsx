import Link from 'next/link'
import { Box, polymorphic, type BoxProps } from '@/components/core/Box'
import {
	ButtonGroup,
	type ButtonGroupProps, type ButtonGroupSpecs
} from './ButtonGroup'
import {
	ButtonSection,
	type ButtonSectionProps, type ButtonSectionSpecs,
} from './ButtonSection'
import { setThemeCSS, type ColorVariable } from '@/lib/theme'
import { useProps, useStyles, useVariantStyles } from '@/hooks'
import { Children, isValidElement, type ReactNode } from 'react'
import type { ComponentPropsWithoutRef, MouseEventHandler, Ref } from 'react'
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

interface LinkButtonProps
	extends ComponentPropsWithoutRef<'a'> {
	href: string
	onClick?: never
	ref?: Ref<HTMLAnchorElement>
	// rel?: ComponentPropsWithoutRef<'a'>['rel']
	// target?: ComponentPropsWithoutRef<'a'>['target']
}

interface NativeButtonProps
	extends ComponentPropsWithoutRef<'button'> {
	href?: never
	onClick?: MouseEventHandler<HTMLButtonElement>
	ref?: Ref<HTMLButtonElement>
	// type?: ComponentPropsWithoutRef<'button'>['type']
}

interface ButtonSpecs {
	// cssVars: { root: ButtonVars }
	default: { component: typeof DEFAULT_TAG }
	props: ButtonProps
	subcomponents: {
		Group: typeof ButtonGroup
		Section: typeof ButtonSection
	}
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
				if (isLeft) left = child
				else right = child
			} else if (process.env.NODE_ENV !== 'production') {
				console.warn(`${NAME}: multiple ${NAME}.Section[${isLeft ? 'left' : 'right'}] found; only the first is rendered.`)
			}
			return
		}

		label.push(child)
	})

	if (!left && !right) return label

	return (
		<>
			{ left }
			<Box as="span" { ...styles('label') }>{ label }</Box>
			{ right }
		</>
	)
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
	const styles = useStyles<ButtonSpecs>({
		name: NAME,
		classes,
		props,
		tokens,
	})

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

	const data = {
		variant,
		priority,
		disabled,
		block: !!fullWidth || null,
	}

	const sharedProps = { data, ...styles('root') }
	const inner = (
		<Box as="span" { ...styles('inner') }>
			{ buildSections(children, styles) }
		</Box>
	)

	if ('href' in rest) {
		// narrows `rest` typing (`LinkButtonProps | NativeButtonProps`)
		// by excluding `NativeButtonProps` from `rest`
		// this allows `rest` to be properly typed

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
