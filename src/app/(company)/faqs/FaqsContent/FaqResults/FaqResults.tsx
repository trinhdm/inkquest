'use client'

import Link from 'next/link'
import { countFaqs, type FaqGroup } from '../../faqs.data'
import { FaqCategory } from '../FaqCategory'

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
			<div className="faq-heading">
				<span aria-live="polite" className="inkq-eyebrow" role="status">
					{ count > 0 ? count : 'No' } { resultStr } &quot;<strong>{ query }</strong>&quot;
				</span>
			</div>

			<div className="faq-content">
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
