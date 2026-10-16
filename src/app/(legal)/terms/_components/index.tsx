'use client'

import { LegalContent } from '../../_components/content'
import { LegalFooter } from '../../_components/footer'
import { LegalHero } from '../../_components/hero'
import { Progress } from '@/components/data/Progress'
import { TERMS_PAGE_DATA } from '../terms.data'

const { id: ID, title: TITLE } = TERMS_PAGE_DATA

export const TermsConditionsBase = () => {
	return (
		<>
			<Progress id={ `${ID}-progress` } label={ `${TITLE} scroll progress` } />
			<LegalHero { ...TERMS_PAGE_DATA } />
			<LegalContent { ...TERMS_PAGE_DATA } />
			<LegalFooter { ...TERMS_PAGE_DATA } />
		</>
	)
}

TermsConditionsBase.displayName = 'TermsConditionsBase'
