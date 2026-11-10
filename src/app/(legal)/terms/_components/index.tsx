'use client'

import { keyHasValue } from '@/utils/helpers'
import { LegalContent } from '../../_components/content'
import { LegalFooter } from '../../_components/footer'
import { LegalHero } from '../../_components/hero'
import { Progress } from '@/components/data/Progress'
import { TERMS_PAGE_DATA } from '../terms.data'

const { content: CONTENT, id: ID, title: TITLE } = TERMS_PAGE_DATA

export const TermsConditionsBase = () => {
	return (
		<>
			<Progress id={ `${ID}-progress` } label={ `${TITLE} scroll progress` } />

			{ keyHasValue(TERMS_PAGE_DATA, 'hero') &&
				<LegalHero { ...TERMS_PAGE_DATA } /> }

			{ !!CONTENT.length &&
				<LegalContent { ...TERMS_PAGE_DATA } /> }

			{ keyHasValue(TERMS_PAGE_DATA, 'footer') &&
				<LegalFooter { ...TERMS_PAGE_DATA } /> }
		</>
	)
}

TermsConditionsBase.displayName = 'TermsConditionsBase'
