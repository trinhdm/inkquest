import { redirect } from 'next/navigation'
import { NavRoutes } from '@/utils/navigation'

export default function Community() {
	redirect(NavRoutes.COMMUNITY_FEED)
}
