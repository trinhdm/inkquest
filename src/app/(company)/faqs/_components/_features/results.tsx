import { useFaqsCtx } from '../../_utils/faqs.context'
import { useParser } from '@/hooks/useParser'
import { countFaqs } from '../../_utils'
import { FaqCategory } from './category'
import type { FaqGroup } from '../../_utils/faqs.data'

interface FaqResultsProps {
	groups: FaqGroup[]
	query: string
	terms: string[]
}

export const FaqResults = ({ groups, query, terms }: FaqResultsProps) => {
	const { data: { search: { error } } } = useFaqsCtx()
	const errorMessage = useParser(error)

	const count = countFaqs(groups),
		resultStr = `result${count === 1 ? '' : 's'} for`

	return (
		<>
			<div className="faq__heading">
				<span aria-live="polite" className="faq__count" role="status">
					<span>{ count > 0 ? count : 'No' }</span> { resultStr } &quot;<strong>{ query }</strong>&quot;
				</span>
			</div>

			<div className="faq__content">
				{ !!groups.length
					? groups.map(group => (
						<FaqCategory
							key={ `faq-result-${group.id}` }
							group={ group }
							terms={ terms }
						/>
					))
					: <p>{ errorMessage }</p>
				}
			</div>
		</>
	)
}

FaqResults.displayName = 'FaqResults'
