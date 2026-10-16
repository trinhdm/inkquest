import { useParser, withEmailLink } from '@/hooks/useParser'
import { Section } from '@/components/layout/Section'
import type { LegalPageData } from '../../_utils/legal.types'

type LegalSectionProps =
	& LegalPageData['content'][number]
	& { index: number }

export const LegalSection = ({
	body,
	id,
	index,
	summary,
	title,
}: LegalSectionProps) => {
	const synopsis = useParser(summary)

	const isIntro = index === -1,
		modifier = `legality--${isIntro ? 'intro' : 'section' }`

	return (
		<Section
			className={ `legality legality--${modifier}` }
			id={ id }
			key={ id }
			layout="content"
			title={ title }
		>
			{ (summary && !isIntro) && (
				<aside className="legality__summary">
					<span className="legality__label">TL;DR</span>
					<p>{ synopsis }</p>
				</aside>
			) }

			<div className="legality__body">
				{ body.map(content => (
					Object.entries(content).map(([key, value]) => {
						const textKey = `${id}-${value}`

						if (key === 'p') return <p key={ textKey }>{ withEmailLink(value) }</p>

						return (
							<ul className="legality__list" key={ textKey }>
								{ (value as string[]).map(val => <li key={ val }>{ val }</li>) }
							</ul>
						)
					})
				)) }
			</div>
		</Section>
	)
}

LegalSection.displayName = 'LegalSection'
