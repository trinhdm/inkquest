import { useEffect, useState } from 'react'
import { usePasswordMeter, METER_CSS } from '../_utils/usePasswordMeter'
import { Icon } from '@/components/core/Icon'
import { PASSWORD_RULES, PASSWORD_SCORE } from '../_utils/data'

const SR_DELAY = 1000
const TOTAL = PASSWORD_RULES.length

interface PasswordCriteriaProps {
	value: string
}

export const PasswordCriteria = ({ value }: PasswordCriteriaProps) => {
	const [summary, setSummary] = useState('')

	const met = PASSWORD_RULES.filter(rule => rule.test(value)).length,
		{ filled, level, skipping } = usePasswordMeter(met)

	const empty = met === 0,
		score = level ? PASSWORD_SCORE[level - 1] : '',
		count = met === TOTAL ? 'All' : `${met} of ${TOTAL}`,
		info = !!value ? `${count} password requirements met.` : ''

	useEffect(() => {
		const timer = setTimeout(() => setSummary(info), SR_DELAY)
		return () => clearTimeout(timer)
	}, [info])

	return (
		<div className="password" style={ METER_CSS }>
			<div
				aria-hidden="true"
				className="password__strength"
				data-empty={ empty ? '' : undefined }
				data-skip={ skipping ? '' : undefined }
			>
				<div className="password__meter">
					{ Array.from({ length: TOTAL }).map((_, i) => (
						<span
							className="password__tier"
							data-met={ i < filled ? '' : undefined }
							key={ i }
						/>
					)) }
				</div>
				<div className="password__score">
					<span>{ score }</span>
				</div>
			</div>

			<ul className="password__criteria" data-unlist>
				{ PASSWORD_RULES.map(rule => {
					const isMet = rule.test(value),
						status = `: ${isMet ? 'has met' : 'has not met'}`

					return (
						<li
							className="password__rule"
							data-met={ isMet ? '' : undefined }
							key={ rule.id }
						>
							<span className="password__feedback">
								{ isMet && <Icon size={ 12 } type="check" /> }
							</span>

							{ rule.label }
							<span className="inkq-sr">{ status }</span>
						</li>
					)
				}) }
			</ul>

			<span className="inkq-sr" role="status">{ summary }</span>
		</div>
	)
}

PasswordCriteria.displayName = 'PasswordCriteria'
