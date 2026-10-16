import type { FaqGroup, FaqsPageData } from './faqs.data'

export const countFaqs = (groups: FaqGroup[]): number =>
	groups.reduce((total, { questions }) => total + questions.length, 0)

export const resolveFaqGroup = (
	items: FaqsPageData['items'],
	value?: string | string[],
): FaqGroup => {
	const id = Array.isArray(value) ? value[0] : value
	return items.find(group => group.id === id) ?? items[0]
}
