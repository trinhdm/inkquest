import type { FaqGroup, FaqsPageData } from './faqs.data'

export const countFaqs = (groups: FaqGroup[]): number =>
	groups.reduce((total, { questions }) => total + questions.length, 0)

export const resolveFaqGroup = (
	content: FaqsPageData['content'],
	value?: string | string[],
): FaqGroup => {
	const id = Array.isArray(value) ? value[0] : value
	return content.find(group => group.id === id) ?? content[0]
}
