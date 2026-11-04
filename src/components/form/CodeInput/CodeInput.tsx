import {
	useEffect,
	useLayoutEffect, useRef, useState,
	type ChangeEvent, type ClipboardEvent,
	type FocusEvent, type KeyboardEvent, type MouseEvent,
} from 'react'

import { useField, type Field } from '../Field'
import { extractOthers } from '@/hooks/useProps'
import { polymorphic } from '@/lib/component/factory'
import { Box } from '@/components/polymorphic/Box'
import type { PropsDefaultList } from '@/lib/component/factory/types'
import classes from './CodeInput.module.scss'

const NAME = 'CodeInput' as const,
	TAG = 'input' as const,
	DEFAULT_LENGTH = 6

const DEFAULT_PROPS = {
	as: TAG,
	autoSubmit: false,
	length: DEFAULT_LENGTH,
} as const

interface BaseCodeInputProps {
	autoSubmit?: boolean		// calls requestSubmit() on the parent form when the code is full
	defaultValue?: string
	length?: number
	name: string
	onChange?: (code: string) => void
	onComplete?: (code: string) => void
	placeholder?: never
	readonly?: boolean
}

type CodeInputProps =
	& Field.ControlProps
	& BaseCodeInputProps

interface CodeInputSpecs {
	context: Field.Context
	defaults: {
		as: typeof TAG
		props: PropsDefaultList<typeof DEFAULT_PROPS>
	}
	props: CodeInputProps
	selectors: CodeInputSelectors
}

type CodeInputSelectors =
	| 'root' | 'box'

interface PendingWork {
	focus?: number
	submit?: boolean
}

const setBox = (list: string[], i: number, digit: string) =>
	list.map((d, k) => (k === i ? digit : d))

//	NFKC turns full-width digits (１２３) into plain ones before the non-digits are dropped
const toDigits = (text: string, max: number) =>
	text.normalize('NFKC').replace(/\D/g, '').slice(0, max)

const toBoxes = (text: string | undefined, length: number) => {
	const digits = toDigits(text ?? '', length)
	return Array.from({ length }, (_, i) => digits[i] ?? '')
}

//	a pasted email line may hold other numbers: prefer a run of exactly `length` digits
const findCode = (text: string, length: number) =>
	text.normalize('NFKC').match(new RegExp(`(?<!\\d)\\d{${length}}(?!\\d)`))?.[0]
		?? toDigits(text, length)

export const CodeInput = polymorphic<CodeInputSpecs>((_props, { useProps, useStyles }) => {
	const { useChosenFieldProps, useFieldCtx } = useField(NAME)

	const context = useFieldCtx(NAME)
	const props = useProps(useChosenFieldProps(_props))
	const styles = useStyles({ context, props })

	const {
		aria, clsx, hasError,
		idx, loader,
	} = context

	const {
		autoSubmit, defaultValue, disabled,
		length, loading, name,
		onComplete, onChange,
		readonly, required, size,
		...rest
	} = props

	//	spread onto box 1 only, so `autoFocus` lands there
	const others = extractOthers(rest)
	const max = length ?? DEFAULT_LENGTH

	const boxesRef = useRef<(HTMLInputElement | null)[]>([])
	const hiddenRef = useRef<HTMLInputElement>(null)
	const pendingRef = useRef<PendingWork>({})

	const [active, setActive] = useState(0) // the one box in the Tab order
	const [digits, setDigits] = useState(() => toBoxes(defaultValue, max))

	// `digits` may be older than `length`: rebuild it, keeping the digits that still fit
	const cells = Array.from({ length: max }, (_, i) => digits[i] ?? ''),
		code = cells.join('')

	const focusBox = (i: number) => {
		const box = boxesRef.current[i]
		box?.focus()
		box?.select()
	}

	// after React wrote the new values, before paint
	useLayoutEffect(() => {
		const { focus, submit } = pendingRef.current
		pendingRef.current = {}

		if (focus !== undefined) focusBox(focus)

		// here, not in the handler: the hidden input only holds the new code after the render
		if (submit) hiddenRef.current?.form?.requestSubmit()
	})

	//	with `autoSubmit` focus is still on the last box, which does not carry the error
	useEffect(() => {
		if (!autoSubmit || !hasError) return

		const first = boxesRef.current[0]
		first?.focus()
		first?.select()
	}, [autoSubmit, hasError])

	const commit = (next: string[], focus?: number) => {
		// nothing changed (arrows, Home, End, a retyped digit): no render, so focus now
		if (next.every((d, k) => d === cells[k])) {
			if (focus !== undefined) focusBox(focus)
			return
		}

		setDigits(next)
		onChange?.(next.join(''))

		// something changed: wait for the layout effect, or the re-render wipes the selection
		pendingRef.current.focus = focus

		if (next.every(Boolean)) {
			onComplete?.(next.join(''))
			pendingRef.current.submit = !!autoSubmit
		}
	}

	const spread = (text: string, start: number) => {
		const next = [...cells]

		for (let k = 0; k < text.length && start + k < max; k++)
			next[start + k] = text[k]

		commit(next, Math.min(start + text.length, max - 1))
	}

	const handleChange = (i: number) => (event: ChangeEvent<HTMLInputElement>) => {
		const { value } = event.currentTarget,
			prev = cells[i],
			raw = toDigits(value, Infinity)

		// the caret sat beside the old digit: drop the old one
		const typed = prev && raw.length === 2 ? raw.replace(prev, '') : raw

		if (typed === prev) {
			// "33": the same digit typed again beside the old one counts as moving on
			if (raw.length > prev.length) focusBox(Math.min(i + 1, max - 1))
			return // otherwise a letter was typed: React puts the old digit back
		}

		if (!value) return commit(setBox(cells, i, '')) // Backspace, Delete or cut
		if (!typed) return // only letters
		if (typed.length === 1) return commit(setBox(cells, i, typed), Math.min(i + 1, max - 1))

		spread(typed, typed.length >= max ? 0 : i) // autofill or a keyboard suggestion
	}

	// the click wins over the browser placing its caret; skip it if focus was sent elsewhere
	const handleClick = (event: MouseEvent<HTMLInputElement>) => {
		if (document.activeElement === event.currentTarget)
			event.currentTarget.select()
	}

	const handleFocus = (i: number) => (event: FocusEvent<HTMLInputElement>) => {
		// an empty code starts at box 1, so autofill is offered there
		if (i !== 0 && cells.every(d => !d)) return focusBox(0)

		setActive(i)
		event.currentTarget.select()
	}

	const handleKeyDown = (i: number) => (event: KeyboardEvent<HTMLInputElement>) => {
		// keep browser shortcuts (paste, select all) working
		if (event.metaKey || event.ctrlKey || event.altKey || readonly) return
		const { key } = event

		const go = (to: number) => {
			event.preventDefault()
			focusBox(to)
		}

		switch (key) {
			case 'Backspace':
				if (cells[i] || i === 0) return // filled: the browser clears it
				event.preventDefault()
				return commit(setBox(cells, i - 1, ''), i - 1)
			case 'ArrowLeft': return go(Math.max(i - 1, 0))
			case 'ArrowRight': return go(Math.min(i + 1, max - 1))
			case 'Home': return go(0)
			case 'End': return go(max - 1)
			default:
				// the same digit typed over itself: React skips `onChange`, so move on here
				if (key === cells[i]) go(Math.min(i + 1, max - 1))
		}
	}

	const handlePaste = (i: number) => (event: ClipboardEvent<HTMLInputElement>) => {
		event.preventDefault()
		if (readonly) return

		const found = findCode(event.clipboardData.getData('text'), max)
		if (found) spread(found, found.length >= max ? 0 : i) // a full code always starts at box 1
	}

	return (
		<>
			<Box
				{ ...styles('root', clsx) }
				attributes={ { aria: {
					busy: aria.busy,
					describedby: aria.describedby,
					labelledby: aria.labelledby,
				} } }
				dir="ltr"
				role="group"
			>
				{ cells.map((digit, i) => {
					const isControl = i === 0,
						index = i + 1

					return (
						<Box
							key={ i }
							{ ...styles('box') }
							{ ...(isControl ? others : {}) }
							as={ TAG }
							attributes={ { aria: {
								label: `Digit ${index} of ${max}`,
								// the description and the "required" word only on box 1,
								// or every auto-advance would read them again
								describedby: isControl ? aria.describedby : undefined,
								required: isControl ? aria.required : undefined,
								invalid: aria.invalid,
							} } }
							autoComplete={ isControl ? 'one-time-code' : 'off' }
							disabled={ !!disabled }
							id={ isControl ? idx.control : `${idx.control}-${index}` }
							inputMode="numeric"
							onChange={ handleChange(i) }
							onClick={ handleClick }
							onFocus={ handleFocus(i) }
							onKeyDown={ handleKeyDown(i) }
							onPaste={ handlePaste(i) }
							readOnly={ !!readonly }
							ref={ (el: HTMLInputElement | null) => { boxesRef.current[i] = el } }
							spellCheck={ false }
							tabIndex={ i === active ? 0 : -1 }
							type="text"
							value={ digit }
						/>
					)
				}) }

				<input
					disabled={ !!disabled }
					name={ name }
					ref={ hiddenRef }
					type="hidden"
					value={ code }
				/>
			</Box>

			{ loader }
		</>
	)
}, { name: NAME, classes })

CodeInput.set({
	defaultProps: DEFAULT_PROPS,
	displayName: NAME,
})

export declare namespace CodeInput {
	export type Props = CodeInputProps
	export type Specs = CodeInputSpecs
}
