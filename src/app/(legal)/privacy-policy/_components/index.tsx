'use client'

import { LegalContent } from '../../_components/content'
import { LegalFooter } from '../../_components/footer'
import { LegalHero } from '../../_components/hero'
import { Progress } from '@/components/data/Progress'
import { PRIVACY_PAGE_DATA } from '../privacy-policy.data'

const { id: ID, title: TITLE } = PRIVACY_PAGE_DATA

export const PrivacyPolicyBase = () => {
	return (
		<>
			<Progress id={ `${ID}-progress` } label={ `${TITLE} scroll progress` } />
			<LegalHero { ...PRIVACY_PAGE_DATA } />
			<LegalContent { ...PRIVACY_PAGE_DATA } />
			<LegalFooter { ...PRIVACY_PAGE_DATA } />
		</>
	)
}

PrivacyPolicyBase.displayName = 'PrivacyPolicyBase'
