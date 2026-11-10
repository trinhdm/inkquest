import { redirect, RedirectType } from 'next/navigation'
import { NavRoutes } from '@/utils/navigation'

export const redirectTo: (route: NavRoutes) => never = route =>
	redirect(route, RedirectType.replace)
