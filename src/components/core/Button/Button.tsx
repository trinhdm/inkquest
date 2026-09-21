import Link from 'next/link'
import { LoaderCircle } from 'lucide-react'
import { isValidElement, useMemo, Children } from 'react'
import { useProps, extractOtherProps } from '@/hooks/useProps'
import { useStyles } from '@/hooks/useStyles'
import { useVariants } from '@/hooks/useVariants'
import { extractChildrenText } from '@/lib/component'
import { isExternalLink } from '@/utils/helpers'
import { polymorphic } from '@/lib/component'
import { Box } from '@/components/polymorphic/Box'
import { ButtonGroup, useButtonGroupProps } from './ButtonGroup'
import { ButtonProvider, type ButtonContext } from './Button.context'
import { ButtonSection } from './ButtonSection'
import type { ComponentPropsWithoutRef, MouseEventHandler, ReactNode, Ref } from 'react'
import type { Route } from 'next'
import type { ListProps } from '@/lib/component/factory/types'
import type { Priority as ThemePriority, Variant as ThemeVariant } from '@/lib/theme'
import classes from './Button.module.scss'

const NAME = 'Button' as const,
	TAG = 'button' as const

const DEFAULT_PROPS = {
	as: TAG,
	size: 'md',
	variant: 'solid',
} as const

type ButtonSize =
	| 'sm'
	| 'md'
	| 'lg'

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

type ButtonProps = BaseButtonProps & (
	| LinkButtonProps
	| NativeButtonProps
)

interface ButtonSpecs {
	defaults: {
		as: typeof TAG
		props: ListProps<typeof DEFAULT_PROPS>
	}
	props: ButtonProps
	subcomponents: {
		Group: typeof ButtonGroup
		Section: typeof ButtonSection
	}
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
	useVariants(NAME)
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
		unstyled,
		...styles('root', clsx),
	}

	const ctxValues = useMemo(() => ({ unstyled }), [unstyled])

	const inner = (
		<ButtonProvider value={ ctxValues }>
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

		let linkProps: LinkButtonProps = {
			...sharedProps,
			...others as Extract<typeof others, LinkButtonProps>,
		}

		// console.log({ href: others.href, external: isExternalLink(others.href) })

		if (isExternalLink(others.href)) {
			const external = { target: '_blank', rel: 'noopener noreferrer' }
			linkProps = { ...linkProps, ...external }
		}

		return <Box { ...linkProps } as={ Link }>{ inner }</Box>
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
Button.setDefaults({ props: DEFAULT_PROPS })

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
