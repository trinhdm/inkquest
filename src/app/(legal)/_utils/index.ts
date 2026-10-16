import type { Route } from 'next'
import type { LegalSection } from './legal.types'
import type { Sidebar } from '@/components/layout/Sidebar'

const getLegalSlug = (slug: string, id: string): Route =>
	`/${slug}#${id}` as Route

const formatLegalTitle = (
	title: LegalSection['title'],
	index: number,
): string =>
	`${index + 1}. ${title}`

export const getLegalTitles = (slug: string, sections: LegalSection[]): Sidebar.LinkItem[] =>
	sections.map(({ id, title }, i) => ({
		id,
		label: formatLegalTitle(title, i),
		url: getLegalSlug(slug, id),
	}))
