import { useEffect, useState } from 'react'
import { Icon } from '@/components/core/Icon'
import { PASSWORD_RULES } from '../_utils/signup.data'

const TOTAL = PASSWORD_RULES.length
const PW_SCORE = ['weak', 'okay', 'good', 'strong'] as const

interface PasswordRulesProps {
	value: string
}

export const PasswordRules = ({ value }: PasswordRulesProps) => {
	const [spoken, setSpoken] = useState('')

	const met = PASSWORD_RULES.filter(rule => rule.test(value)).length
	const summary = !value ? ''
			: met === TOTAL ? 'All password requirements met.'
				: `${met} of ${TOTAL} password requirements met.`

	useEffect(() => {
		const timer = setTimeout(() => setSpoken(summary), 1000)
		return () => clearTimeout(timer)
	}, [summary])

	return (
		<div className="password">
			<div className="password__checker">
				<div className="password__strength">
					{ Array.from({ length: TOTAL }).map((_, i) => (
						<span
							className="password__criteria"
							data-met={ i + 1 <= met || undefined }
							key={ i }
						/>
					)) }
				</div>
				<div className="password__score">
					<span>{ PW_SCORE[met - 1] ?? 'SCORE' }</span>
				</div>
			</div>

			<ul className="password__requirements" data-unlist>
				{ PASSWORD_RULES.map(rule => {
					const isMet = rule.test(value)

					return (
						<li
							key={ rule.id }
							className="password__requirement"
							data-met={ isMet || undefined }
						>
							<span className="password__status">
								{ isMet && <Icon size={ 12 } type="check" /> }
							</span>

							{ rule.label }

							<span className="inkq-sr">{ isMet ? ', met' : ', not met yet' }</span>
						</li>
					)
				}) }
			</ul>

			<span className="inkq-sr" role="status">{ spoken }</span>
		</div>
	)
}

PasswordRules.displayName = 'PasswordRules'
