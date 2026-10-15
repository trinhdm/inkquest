import { FAQ_ITEMS, type FaqGroup } from './faqs.data'

export const countFaqs = (groups: FaqGroup[]): number =>
	groups.reduce((total, { questions }) => total + questions.length, 0)

export const resolveFaqGroup = (value?: string | string[]): FaqGroup => {
	const id = Array.isArray(value) ? value[0] : value
	return FAQ_ITEMS.find(group => group.id === id) ?? FAQ_ITEMS[0]
}
