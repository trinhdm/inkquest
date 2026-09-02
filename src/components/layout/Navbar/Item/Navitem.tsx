import Link from 'next/link'
import { useProps, useStyles } from '@/hooks'
import { Box, polymorphic } from '@/components/core/Box'
import type { Route } from 'next'
import classes from '../Navbar.module.scss'

const NAME = 'Navitem' as const,
	TAG = 'li' as const

interface NavitemProps<T extends string = string> {
	href: T
	items?: NavitemProps<T>[]
	label: string
}

interface NavitemSpecs {
	default: { component: typeof TAG }
	props: NavitemProps
}

export const Navitem = polymorphic<NavitemSpecs>(_props => {
	const props = useProps(NAME, _props)
	const styles = useStyles(NAME, { classes, props })
	console.log(props)

	const {
		as,
		label,
		href,
		items,
		...rest
	} = props

	return (
		<Box
			as={ as }
			{ ...styles('root') }
			{ ...rest }
		>
			<Box as="span">
				<Link href={ href as Route<typeof href> }>
					{ label }
				</Link>
				{/* { items && items.length > 1 && (
					<Box as="ul">
						{ items.map(item => <Box as={ Navitem } { ...item } />) }
					</Box>
				) } */}
			</Box>
		</Box>
	)
}, classes)

Navitem.displayName = NAME
Navitem.setDefaults({
	props: {
		as: TAG,
	}
})

export declare namespace Navitem {
	export type Props = NavitemProps
	export type Specs = NavitemSpecs
}
