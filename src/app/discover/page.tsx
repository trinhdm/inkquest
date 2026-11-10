import { redirect } from 'next/navigation'
import { NavRoutes } from '@/utils/navigation'

export default function Discover() {
	redirect(NavRoutes.DISCOVER_ARTISTS)
}
