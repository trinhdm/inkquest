'use client'

import { usePathname } from 'next/navigation'
import { useProps, extractOtherProps } from '@/hooks/useProps'
import { polymorphic } from '@/lib/component'
import { Box } from '@/components/polymorphic/Box'
import { Navbar } from '../Navbar'
import { Subnav } from '../Subnav'
import { HEADER_GLOBAL_NAV, listRoutesWithSlug, type NavRoute } from '@/utils/navigation'
import type { PropsDefaultList } from '@/lib/component/factory/types'
import classes from './Header.module.scss'

const NAME = 'Header' as const,
	TAG = 'header' as const

const DEFAULT_PROPS = {
	as: TAG,
	navbar: { routes: HEADER_GLOBAL_NAV },
} as const

interface HeaderProps {
	navbar?: Navbar.Props
	subnav?: Subnav.Props
}

interface HeaderSpecs {
	defaults: {
		as: typeof TAG
		props: PropsDefaultList<typeof DEFAULT_PROPS>
	}
	props: HeaderProps
	selectors: HeaderSelectors
}

type HeaderSelectors =
	| 'root'

export const Header = polymorphic<HeaderSpecs>((_props, { useStyles }) => {
	const pathname = usePathname()
	const props = useProps(NAME, _props)
	const styles = useStyles(NAME, { props })

	const {
		as,
		children,
		navbar,
		subnav,
		...rest
	} = props

	const others = extractOtherProps(rest)

	const subnavRoutes = !!subnav?.routes?.length
		? subnav.routes
		: listRoutesWithSlug(pathname as NavRoute)

	return (
		<Box { ...styles('root') } { ...others } as={ as }>
			<Navbar routes={ navbar?.routes } />
			<Subnav category={ subnav?.category } routes={ subnavRoutes } />
		</Box>
	)
}, classes)

Header.displayName = NAME
Header.setDefaults({ props: DEFAULT_PROPS })

export declare namespace Header {
	export type Props = HeaderProps
	export type Specs = HeaderSpecs
}
