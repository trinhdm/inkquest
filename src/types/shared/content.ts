import type { ReactNode } from 'react'
import type { Route } from 'next'
import type { CalendarDate } from './datetime'
import type { SOCIAL_BRANDS } from '@/utils/constants'

//	files

type FileType =
	'pdf' | 'zip'

export interface FileItem {
	size?: string
	type?: FileType
	url: Route<string>
}


//	nextjs page data

export interface PageDataItem {
	id: string
	title: string
	content?: ReactNode
}

export interface AssetItem
	extends PageDataItem {
	attachment?: FileItem
}

export interface JobItem
	extends PageDataItem {
	department: | 'artist relations' | 'community' | 'engineering' | 'trust & safety'
	location: string[]
	publishDate?: CalendarDate
	role?: ReactNode[]
	url: Route<string>
}

export interface PressItem
	extends Omit<PageDataItem, 'content'> {
	author: string
	publishDate?: CalendarDate
	url?: Route<string>
}

export interface StaffItem {
	id: string
	name: string
	role?: ReactNode[]
}

export interface StatisticItem {
	id: string
	caption?: string
	icon?: ReactNode
	isHighlight?: boolean
	value: number | string
}


//	company / brand

export type SocialBrand =
	(typeof SOCIAL_BRANDS)[number]

// export interface StyleContext {
// 	classes?: Record<string, string>
// }
