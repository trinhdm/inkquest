'use client'

import { keyHasValue } from '@/utils/helpers'
import { CareersCulture } from './culture'
import { CareersHero } from './hero'
import { CareersListings } from './listings'
import { CareersProcess } from './process'
import { CAREERS_PAGE_DATA } from '../_utils/careers.data'

const { content: CONTENT, id: ID } = CAREERS_PAGE_DATA

export const CareersBase = () => {
	return (
		<>
			{ keyHasValue(CAREERS_PAGE_DATA, 'hero') &&
				<CareersHero { ...CAREERS_PAGE_DATA } /> }

			{ CONTENT?.map(section => {
				if (!keyHasValue(section, 'body') || !section.body.length)
					return null

				const id = `${ID}-${section.id}`,
					key = `${id}-section`

				switch (section.id) {
					case 'culture':
						return <CareersCulture { ...section } id={ id } key={ key } />
					case 'listings':
						return <CareersListings { ...section } id={ id } key={ key} />
					case 'process':
						return <CareersProcess { ...section } id={ id } key={ key } />
					default:
						return null
				}
			}) }
		</>
	)
}

CareersBase.displayName = 'CareersBase'
