'use client'

import { CareersCulture } from './culture'
import { CareersHero } from './hero'
import { CareersListings } from './listings'
import { CareersProcess } from './process'
import { CAREERS_PAGE_DATA } from '../_utils/careers.data'

const { content: CONTENT, id: ID } = CAREERS_PAGE_DATA

export const CareersBase = () => {
	return (
		<>
			<CareersHero { ...CAREERS_PAGE_DATA } />

			{ CONTENT?.map(section => {
				const id = `${ID}-${section.id}`,
					key = `${id}-section`

				switch (section.id) {
					case 'culture':
						return <CareersCulture { ...section } id={ id } key={ key } />
					case 'listings':
						return <CareersListings { ...section } id={ id } key={ key} />
					case 'process':
						return <CareersProcess { ...section } id={ id } key={ key } />
				}
			}) }
		</>
	)
}

CareersBase.displayName = 'CareersBase'
