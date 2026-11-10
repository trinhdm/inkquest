'use client'

import { keyHasValue } from '@/utils/helpers'
import { LegalContent } from '../../_components/content'
import { LegalFooter } from '../../_components/footer'
import { LegalHero } from '../../_components/hero'
import { Progress } from '@/components/data/Progress'
import { COOKIES_DATA } from '../cookies.data'

const { content: CONTENT, id: ID, title: TITLE } = COOKIES_DATA

export const CookiesBase = () => {
	return (
		<>
			<Progress id={ `${ID}-progress` } label={ `${TITLE} scroll progress` } />

			{ keyHasValue(COOKIES_DATA, 'hero') &&
				<LegalHero { ...COOKIES_DATA } /> }

			{ !!CONTENT.length &&
				<LegalContent { ...COOKIES_DATA } /> }

			{ keyHasValue(COOKIES_DATA, 'footer') &&
				<LegalFooter { ...COOKIES_DATA } /> }
		</>
	)
}

CookiesBase.displayName = 'CookiesBase'
