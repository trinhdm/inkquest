import { useState, type SubmitEvent } from 'react'

export interface FormHistory<S extends string> {
	back: () => void
	guard: (event: SubmitEvent<HTMLFormElement>, options?: { when?: boolean }) => void
	navigate: (next: S, options?: { wait?: boolean }) => void
	restart: () => void
	startWait: () => void
	stopWait: () => void
	canGoBack: boolean
	current: S
	waiting: boolean
}

export const useFormHistory = <S extends string>(start: S): FormHistory<S> => {
	const [history, setHistory] = useState<S[]>([start])
	const [waiting, setWaiting] = useState(false)
	const depth = history.length

	const navigate: FormHistory<S>['navigate'] = (next, { wait = false } = {}) => {
		setWaiting(wait)
		setHistory(prev => {
			const current = prev[prev.length - 1]
			return current === next ? prev : [...prev, next]
		})
	}

	const back = () => {
		setWaiting(false)
		setHistory(prev => prev.length > 1 ? prev.slice(0, -1) : prev)
	}

	const restart = () => {
		setWaiting(false)
		setHistory([start])
	}

	const guard: FormHistory<S>['guard'] = (event, { when = false } = {}) => {
		if (waiting || when) event.preventDefault()
	}

	return {
		back, guard, navigate, restart,
		startWait: () => setWaiting(true),
		stopWait: () => setWaiting(false),
		canGoBack: depth > 1,
		current: history[depth - 1],
		waiting,
	}
}
