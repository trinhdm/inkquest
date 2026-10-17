'use client'

import { keyHasValue } from '@/utils/helpers'
import { LegalContent } from '../../_components/content'
import { LegalFooter } from '../../_components/footer'
import { LegalHero } from '../../_components/hero'
import { Progress } from '@/components/data/Progress'
import { PRIVACY_PAGE_DATA } from '../privacy-policy.data'

const { content: CONTENT, id: ID, title: TITLE } = PRIVACY_PAGE_DATA

export const PrivacyPolicyBase = () => {
	return (
		<>
			<Progress id={ `${ID}-progress` } label={ `${TITLE} scroll progress` } />

			{ keyHasValue(PRIVACY_PAGE_DATA, 'hero') &&
				<LegalHero { ...PRIVACY_PAGE_DATA } /> }

			{ !!CONTENT.length &&
				<LegalContent { ...PRIVACY_PAGE_DATA } /> }

			{ keyHasValue(PRIVACY_PAGE_DATA, 'footer') &&
				<LegalFooter { ...PRIVACY_PAGE_DATA } /> }
		</>
	)
}

PrivacyPolicyBase.displayName = 'PrivacyPolicyBase'
