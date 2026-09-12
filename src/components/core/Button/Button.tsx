import Link from 'next/link'
import { LoaderCircle } from 'lucide-react'
import { isValidElement, useMemo, Children } from 'react'
import { useProps, useStyles, useVariantStyles } from '@/hooks'
import { extractChildrenText, extractOtherProps } from '@/utils/helpers'
import { Box, polymorphic } from '@/components/core/Box'
import { ButtonGroup, useButtonGroupProps } from './ButtonGroup'
import { ButtonProvider, type ButtonContext } from './Button.context'
import { ButtonSection } from './ButtonSection'
// import { Icon } from '../Icon'
// import { setThemeCSS, type ColorVariable } from '@/lib/theme'
import type { ComponentPropsWithoutRef, MouseEventHandler, ReactNode, Ref } from 'react'
import type { Route } from 'next'
import type { Priority as ThemePriority, Variant as ThemeVariant } from '@/lib/theme'
import classes from './Button.module.scss'

const NAME = 'Button' as const,
	DEFAULT_TAG = 'button' as const

// type ButtonVars = ColorVariable<typeof NAME>

type ButtonSize =
	| 'sm'
	| 'md'
	| 'lg'

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

interface BaseButtonProps {
	children: ReactNode
	disabled?: boolean
	fullWidth?: boolean
	loading?: boolean
	priority?: ThemePriority
	size?: ButtonSize
	showLabel?: boolean
	variant?: ThemeVariant
}

type ButtonProps = BaseButtonProps & (
	| LinkButtonProps
	| NativeButtonProps
)

interface ButtonSpecs {
	default: { component: typeof DEFAULT_TAG }
	props: ButtonProps
	subcomponents: {
		Group: typeof ButtonGroup
		Section: typeof ButtonSection
	}
	// tokens: { stylesheet?: ButtonVars }
}

const buildSections = (
	children: ButtonProps['children'],
	styles: ReturnType<typeof useStyles>
) => {
	const label: ReactNode[] = []
	let left: ReactNode = null,
		right: ReactNode = null

	Children.toArray(children).forEach(child => {
		if (isValidElement<ButtonSection.Props>(child) && child.type === ButtonSection) {
			const isLeft = 'left' in child.props && !!child.props.left,
				taken = isLeft ? left : right

			if (!taken) {
				if (isLeft) left = child
				else right = child
			} else if (process.env.NODE_ENV !== 'production') {
				const section = `${NAME}.Section`
				console.warn(`${NAME}: multiple ${section}[${isLeft ? 'left' : 'right'}] found; only the first ${section} is rendered.`)
			}
			return
		}

		label.push(child)
	})

	const content = <span { ...styles('label') }>{ label }</span>

	if (!left && !right) return content
	return <>{ left }{ content }{ right }</>
}

export const Button = polymorphic<ButtonSpecs>(_props => {
	useVariantStyles(NAME)
	const props = useProps(NAME, useButtonGroupProps(_props))
	const styles = useStyles(NAME, { classes, props })

	const {
		children,
		disabled,
		fullWidth,
		loading,
		priority,
		size,
		showLabel,
		unstyled,
		variant,
		...rest
	} = props

	const { as, others } = extractOtherProps(rest)

	const clsx = {
		global: { block: fullWidth },
		module: { [`${size}`]: size },
	}

	const ariaLabel = extractChildrenText(children),
		aria = { label: !!(showLabel && ariaLabel.length) ? ariaLabel : undefined }

	const data = {
		variant,
		priority,
		block: !!fullWidth || null,
		disabled: !!disabled || null,
		loading: !!loading || null,
	}

	const sharedProps = {
		attributes: { aria, data },
		...styles('root', clsx),
	}

	const cxtValue = useMemo(() => ({ displayName: NAME, unstyled }), [unstyled])

	const inner = (
		<ButtonProvider value={ cxtValue }>
			<Box as="span" { ...styles('inner') }>
				{ loading && <Box as={ LoaderCircle } { ...styles('icon') } /> }
				{ buildSections(children, styles) }
			</Box>
		</ButtonProvider>
	)

	if ('href' in others) {
		// narrows `rest` typing (`LinkButtonProps | NativeButtonProps`)
		// by excluding `NativeButtonProps` from `rest`
		// this allows `rest` to be properly typed

		return (
			<Box
				{ ...sharedProps }
				{ ...others as Extract<typeof others, LinkButtonProps> }
				as={ Link }
			>
				{ inner }
			</Box>
		)
	}

	return (
		<Box
			{ ...sharedProps }
			{ ...others }
			as={ as }
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
	export type Context = ButtonContext
	export type Props = ButtonProps
	export type Specs = ButtonSpecs

	export type Priority = ThemePriority
	export type Size = ButtonSize
	export type Variant = ThemeVariant

	export namespace Group {
		export type Context = ButtonGroup.Context
		export type Props = ButtonGroup.Props
		export type Specs = ButtonGroup.Specs
	}

	export namespace Section {
		export type Props = ButtonSection.Props
		export type Specs = ButtonSection.Specs
	}
}


// const tokens = setThemeCSS<ButtonSpecs>((theme, _props) => {
// 	const rootTokens = {}

// 	if (Object.hasOwn(_props, 'variant')) {

// 		const variants = deriveVariants({ name: NAME }, theme)
// 		console.log({ variants })
// 		// const styles = serializeStyles([variants]) ?? undefined
// 		if (!!variants)
// 			Object.assign(rootTokens, { stylesheet: variants })
// 	}

// 	// const buttonHeights = {
// 	// 	sm: '2.25rem',
// 	// 	md: '2.5rem',
// 	// 	lg: '2.75rem',
// 	// }

// 	return {
// 		...rootTokens,
// 		// root: {
// 		// 	'--button-height': buttonHeights[_props.size],
// 		// },

// 		// root: {
// 		// 	// ...variants,
// 		// 	// '--button-height': 36px,		// .button__inner height: 0.5 * --button-height
// 		// 	// '--button-pad': `${tokens.space.inset('sm')} ${tokens.space.inset('lg')}`,
// 		// }
// 	}
// })
