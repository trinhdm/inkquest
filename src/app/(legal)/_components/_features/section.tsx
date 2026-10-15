import { Section } from '@/components/layout/Section'
import type { LegalPageData } from '../../_utils/legal.types'

type LegalSectionProps =
	& LegalPageData['sections'][number]
	& { index: number }

const withEmailLink = (text: string) => {
	const emailRegex = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g,
		parts = text.split(emailRegex);

	return parts.map((part, index) => {
		if (emailRegex.test(part))
			return <a key={index} href={ `mailto:${part}` } data-cta>{part}</a>

		return part
	})
}

export const LegalSection = ({
	body,
	id,
	index,
	summary,
	title,
}: LegalSectionProps) => {
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
					<p>{ summary }</p>
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
