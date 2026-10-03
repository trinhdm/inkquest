import { LoaderCircle } from 'lucide-react'
import { isValidElement, useMemo, Children } from 'react'
import { extractChildrenText } from '@/lib/component'
import { extractOthers } from '@/hooks/useProps'
import { isExternalLink, keyHasValue } from '@/utils/helpers'
import { polymorphic } from '@/lib/component'
import { Box } from '@/components/polymorphic/Box'
import { ButtonGroup, useButtonGroupProps } from './ButtonGroup'
import { ButtonProvider, type ButtonContext } from './Button.context'
import { ButtonSection } from './ButtonSection'
import type { ComponentPropsWithoutRef, MouseEventHandler, ReactNode, Ref } from 'react'
import type { Route } from 'next'
import type {
	Priority as ThemePriority,
	Tone as ThemeTone,
	Variant as ThemeVariant,
} from '@/lib/theme/types'
import type { PropsDefaultList } from '@/lib/component/factory/types'
import type { Size } from '@/types/shared'
import type { StyleFn } from '@/hooks/useStyles'
import Link, { type LinkProps } from 'next/link'
import classes from './Button.module.scss'

const NAME = 'Button' as const,
	TAG = 'button' as const

const DEFAULT_PROPS = {
	as: TAG,
	size: 'md',
	variant: 'solid',
} as const

const SUBCOMPONENTS = {
	Group: ButtonGroup,
	Section: ButtonSection,
} as const

interface BaseButtonProps {
	children: ReactNode
	disabled?: boolean
	fullWidth?: boolean
	loading?: boolean
	priority?: ThemePriority
	size?: Size
	showLabel?: boolean
	tone?: ThemeTone
	variant?: ThemeVariant
}

type LinkOptions<T extends string = string> =
	Pick<LinkProps<T>, 'onNavigate' | 'prefetch' | 'replace' | 'scroll'>

interface LinkButtonProps<T extends string = string>
	extends ComponentPropsWithoutRef<'a'>, LinkOptions<T> {
	href: Route<T>
	onClick?: never
	ref?: Ref<HTMLAnchorElement>
}

interface NativeButtonProps
	extends ComponentPropsWithoutRef<'button'>, Record<keyof LinkOptions, never> {
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
		props: PropsDefaultList<typeof DEFAULT_PROPS>
	}
	props: ButtonProps
	selectors: ButtonSelectors
	subcomponents: typeof SUBCOMPONENTS
}

type ButtonSelectors =
	| 'root' | 'inner'
	| 'icon' | 'label'

const buildSections = (
	children: ButtonProps['children'],
	styles: StyleFn<ButtonSpecs>,
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
			} return
		}

		label.push(child)
	})

	const content = <span { ...styles('label') }>{ label }</span>

	if (!left && !right) return content
	return <>{ left }{ content }{ right }</>
}

export const Button = polymorphic<ButtonSpecs>((_props, { useProps, useStyles, useVariants }) => {
	useVariants()
	const props = useProps(useButtonGroupProps(_props))
	const styles = useStyles({ props })

	const {
		as,
		children,
		disabled,
		fullWidth,
		loading,
		prefetch,
		priority,
		replace,
		scroll,
		size,
		showLabel,
		tone,
		unstyled,
		variant,
		...rest
	} = props

	const others = extractOthers(rest)

	const clsx = {
		global: { block: fullWidth },
		module: { [`${size}`]: size },
	}

	const ariaLabel = extractChildrenText(children),
		aria = { label: !!(showLabel && ariaLabel.length) ? ariaLabel : undefined }

	const data = {
		variant,
		tone,
		priority,
		block: !!fullWidth || null,
		disabled: !!disabled || null,
		loading: !!loading || null,
	}

	const sharedProps = {
		...styles('root', clsx),
		attributes: { aria, data },
		unstyled,
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

	if ('href' in others && keyHasValue(others, 'href')) {
		// narrows `rest` typing (`LinkButtonProps | NativeButtonProps`)
		// by excluding `NativeButtonProps` from `rest`
		// this allows `rest` to be properly typed

		const { href } = others
		let linkProps = {
			...sharedProps,
			...others as Extract<typeof others, LinkButtonProps>,
			href: href as Route<typeof href>,
		}

		if (isExternalLink(href)) {
			const external = { target: '_blank', rel: 'noopener noreferrer' }
			linkProps = { ...linkProps, ...external }
		}

		return (
			<Box
				{ ...linkProps }
				as={ Link }
				prefetch={ prefetch }
				scroll={ scroll }
				replace={ replace }
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
}, { name: NAME, classes })

Button.set({
	defaultProps: DEFAULT_PROPS,
	displayName: NAME,
	subcomponents: SUBCOMPONENTS,
})

export declare namespace Button {
	export type Context = ButtonContext
	export type Props = ButtonProps
	export type Specs = ButtonSpecs

	export type Priority = ThemePriority
	export type Tone = ThemeTone
	export type Variant = ThemeVariant

	export type Size = NonNullable<Button.Props['size']>

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
