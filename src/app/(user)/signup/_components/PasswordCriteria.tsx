import { useEffect, useState } from 'react'
import { Icon } from '@/components/core/Icon'
import { PASSWORD_RULES, PASSWORD_SCORE } from '../_utils/signup.data'

const SR_DELAY = 1000
const TOTAL = PASSWORD_RULES.length

interface PasswordCriteriaProps {
	value: string
}

export const PasswordCriteria = ({ value }: PasswordCriteriaProps) => {
	const [animating, setAnimating] = useState(false)
	const [skipping, setSkipping] = useState(false)

	const [cached, setCached] = useState(0)
	const [shown, setShown] = useState(0)
	const [summary, setSummary] = useState('')

	const met = PASSWORD_RULES.filter(rule => rule.test(value)).length,
		score = PASSWORD_SCORE[(met || cached) - 1] ?? ''

	const empty = met === 0,
		count = met === TOTAL ? 'All' : `${met} of ${TOTAL}`,
		info = !!value ? `${count} password requirements met.` : ''

	useEffect(() => {
		const timer = setTimeout(() => setSummary(info), SR_DELAY)
		return () => clearTimeout(timer)
	}, [info])

	if (empty && shown > 0) {
		setCached(shown)
		setShown(0)
		setSkipping(false)
		setAnimating(true)
	} else if (!animating && shown !== met) {
		const steps = met - shown > 2

		setSkipping(steps)
		setAnimating(true)
		setShown(steps ? met : shown + Math.sign(met - shown))
	}

	const handleBarDone = () => {
		setAnimating(false)
		setSkipping(false)
		setCached(0)
	}

	return (
		<div className="password">
			<div
				aria-hidden="true"
				className="password__strength"
				data-empty={ empty ? '' : undefined }
				data-skip={ skipping ? '' : undefined }
			>
				<div
					className="password__meter"
					onTransitionCancel={ handleBarDone }
					onTransitionEnd={ handleBarDone }
				>
					{ Array.from({ length: TOTAL }).map((_, i) => (
						<span
							className="password__tier"
							data-met={ i + 1 <= shown ? '' : undefined }
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
						status = `: has ${isMet ? '' : 'not'} met`.replace(/\s+/g, ' ').trim()

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
