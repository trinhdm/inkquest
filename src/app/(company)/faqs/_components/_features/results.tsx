import Link from 'next/link'
import { countFaqs } from '../../_utils'
import { FaqCategory } from './category'
import type { FaqGroup } from '../../_utils/faqs.data'

interface FaqResultsProps {
	groups: FaqGroup[]
	query: string
	terms: string[]
}

export const FaqResults = ({ groups, query, terms }: FaqResultsProps) => {
	const count = countFaqs(groups),
		resultStr = `result${count === 1 ? '' : 's'} for`

	return (
		<>
			<div className="faq__heading">
				<span aria-live="polite" className="faq__count" role="status">
					{ count > 0 ? <span>{ count }</span> : 'No' } { resultStr } &quot;<strong>{ query }</strong>&quot;
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
					: <p>Try a different word, or <Link href="/messages" data-cta>ask us</Link> directly and we&apos;ll answer.</p>
				}
			</div>
		</>
	)
}

FaqResults.displayName = 'FaqResults'
