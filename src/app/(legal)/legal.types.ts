import type { CalendarDate, PageDataItem } from '@/types/shared'

export interface VersionGroup {
	date?: CalendarDate
	note?: string
	version: number | `${number}`
}

export type LegalSection =
	& BaseLegalSection
	& LegalSectionTypes

interface BaseLegalSection
	extends Pick<PageDataItem, 'id'> {
	body: LegalBodyOptions[]
}

interface LegalIntroSection {
	summary?: never
	title?: never
}

interface LegalContentSection {
	summary?: string
	title?: PageDataItem['title']
}

type LegalSectionTypes =
	| LegalIntroSection
	| LegalContentSection

type LegalBodyOptions =
	| { list: string[] }
	| { p: string }
