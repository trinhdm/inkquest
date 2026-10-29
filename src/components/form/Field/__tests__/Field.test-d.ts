/**
 * Type-level tests for the Field state contract: the Field wrapper owns
 * `disabled`, `readonly`, `required` (plus `invalid` and `loading`), and the
 * controls (`Field.Input`, `Field.Number`, `Field.Textarea`, `Field.Choice`)
 * reject them through `Field.ControlProps`.
 *
 * Moving keys between the Field types once reopened this gap without any
 * error, so every state prop is pinned per control. Each `@ts-expect-error`
 * sits on its own line, so a prop that starts compiling shows up as an
 * "unused @ts-expect-error". Compile-time only; `npm run test:types` runs it.
 */
import type { ReactNode } from 'react'
import type { Field } from '../Field'

// ---- Field.Input ----------------------------------------------------

const _InputBase: Field.Input.Props = { name: 'a' }

const _InputNoDisabled: Field.Input.Props = {
	name: 'a',
	// @ts-expect-error state props belong to <Field>
	disabled: true,
}

const _InputNoReadonly: Field.Input.Props = {
	name: 'a',
	// @ts-expect-error state props belong to <Field>
	readonly: true,
}

const _InputNoRequired: Field.Input.Props = {
	name: 'a',
	// @ts-expect-error state props belong to <Field>
	required: true,
}

const _InputNoLoading: Field.Input.Props = {
	name: 'a',
	// @ts-expect-error state props belong to <Field>
	loading: true,
}

const _InputNoInvalid: Field.Input.Props = {
	name: 'a',
	// @ts-expect-error state props belong to <Field>
	invalid: true,
}

const _InputSize: Field.Input.Props = { name: 'a', size: 'lg' }
const _InputUnstyled: Field.Input.Props = { name: 'a', unstyled: true }
const _InputType: Field.Input.Props = { name: 'a', type: 'email' }

// ---- Field.Number ---------------------------------------------------

const _NumberBase: Field.Number.Props = { name: 'a', type: 'number' }

const _NumberNoDisabled: Field.Number.Props = {
	name: 'a', type: 'number',
	// @ts-expect-error state props belong to <Field>
	disabled: true,
}

const _NumberNoReadonly: Field.Number.Props = {
	name: 'a', type: 'number',
	// @ts-expect-error state props belong to <Field>
	readonly: true,
}

const _NumberNoRequired: Field.Number.Props = {
	name: 'a', type: 'number',
	// @ts-expect-error state props belong to <Field>
	required: true,
}

const _NumberNoLoading: Field.Number.Props = {
	name: 'a', type: 'number',
	// @ts-expect-error state props belong to <Field>
	loading: true,
}

const _NumberNoInvalid: Field.Number.Props = {
	name: 'a', type: 'number',
	// @ts-expect-error state props belong to <Field>
	invalid: true,
}

const _NumberSize: Field.Number.Props = { name: 'a', type: 'number', size: 'lg' }
const _NumberUnstyled: Field.Number.Props = { name: 'a', type: 'number', unstyled: true }

// ---- Field.Textarea -------------------------------------------------

const _TextareaBase: Field.Textarea.Props = { name: 'a' }

const _TextareaNoDisabled: Field.Textarea.Props = {
	name: 'a',
	// @ts-expect-error state props belong to <Field>
	disabled: true,
}

const _TextareaNoReadonly: Field.Textarea.Props = {
	name: 'a',
	// @ts-expect-error state props belong to <Field>
	readonly: true,
}

const _TextareaNoRequired: Field.Textarea.Props = {
	name: 'a',
	// @ts-expect-error state props belong to <Field>
	required: true,
}

const _TextareaNoLoading: Field.Textarea.Props = {
	name: 'a',
	// @ts-expect-error state props belong to <Field>
	loading: true,
}

const _TextareaNoInvalid: Field.Textarea.Props = {
	name: 'a',
	// @ts-expect-error state props belong to <Field>
	invalid: true,
}

const _TextareaSize: Field.Textarea.Props = { name: 'a', size: 'lg' }
const _TextareaUnstyled: Field.Textarea.Props = { name: 'a', unstyled: true }

// ---- Field.Choice ---------------------------------------------------

const _ChoiceBase: Field.Choice.Props = { name: 'a', value: '1' }

const _ChoiceNoDisabled: Field.Choice.Props = {
	name: 'a', value: '1',
	// @ts-expect-error state props belong to <Field>
	disabled: true,
}

const _ChoiceNoReadonly: Field.Choice.Props = {
	name: 'a', value: '1',
	// @ts-expect-error state props belong to <Field>
	readonly: true,
}

const _ChoiceNoRequired: Field.Choice.Props = {
	name: 'a', value: '1',
	// @ts-expect-error state props belong to <Field>
	required: true,
}

const _ChoiceNoLoading: Field.Choice.Props = {
	name: 'a', value: '1',
	// @ts-expect-error state props belong to <Field>
	loading: true,
}

const _ChoiceNoInvalid: Field.Choice.Props = {
	name: 'a', value: '1',
	// @ts-expect-error state props belong to <Field>
	invalid: true,
}

const _ChoiceSize: Field.Choice.Props = { name: 'a', value: '1', size: 'lg' }
const _ChoiceUnstyled: Field.Choice.Props = { name: 'a', value: '1', unstyled: true }
const _ChoiceType: Field.Choice.Props = { name: 'a', value: '1', type: 'checkbox' }

// ---- Field ------------------------------------------------------------

declare const children: ReactNode

const _FieldRequired: Field.Props = { id: 'a', children, required: true }
const _FieldReadonly: Field.Props = { id: 'a', children, readonly: true }
const _FieldDisabled: Field.Props = { id: 'a', children, disabled: true }
const _FieldLoading: Field.Props = { id: 'a', children, loading: true }
const _FieldInvalid: Field.Props = { id: 'a', children, invalid: true }
const _FieldAll: Field.Props = {
	id: 'a', children, disabled: true, readonly: true, required: true,
}

// ---- Field.Number: inputmode ------------------------------------------

// positive controls: both valid shapes compile
const _NumberDigit: Field.Number.Props = { name: 'a', type: 'text', inputmode: 'numeric' }
const _NumberDigitLimit: Field.Number.Props = { name: 'a', type: 'text', inputmode: 'tel', maxLength: 6 }

// @ts-expect-error a text-typed number input needs an inputmode
const _NumberTextNoMode: Field.Number.Props = { name: 'a', type: 'text' }

const _NumberTypeNoMode: Field.Number.Props = {
	name: 'a', type: 'number',
	// @ts-expect-error inputmode belongs to the text-typed digit input
	inputmode: 'numeric',
}

// @ts-expect-error a limit only makes sense on the text-typed digit input
const _NumberTypeNoMaxLength: Field.Number.Props = { name: 'a', type: 'number', maxLength: 1 }

const _NumberDigitNoIcon: Field.Number.Props = {
	name: 'a', type: 'text', inputmode: 'numeric',
	// @ts-expect-error the digit input has no icon
	iconPosition: 'left',
}

const _NumberTypeIconPosition: Field.Number.Props = { name: 'a', type: 'number', iconPosition: 'right' }

// ---- Field layouts ----------------------------------------------------

const _LayoutDefault: Field.Props = {
	id: 'a', children, layout: 'default', iconPosition: 'left', labelPosition: 'last', size: 'sm',
}

const _LayoutInline: Field.Props = {
	id: 'a', children, layout: 'inline', labelPosition: 'last', size: 'sm',
}

const _LayoutInlineNoIcon: Field.Props = {
	id: 'a', children, layout: 'inline',
	// @ts-expect-error the inline layout draws no icon
	iconPosition: 'left',
}

const _LayoutButton: Field.Props = { id: 'a', children, layout: 'button', caption: 'Hint' }

const _LayoutButtonNoSize: Field.Props = {
	id: 'a', children, layout: 'button',
	// @ts-expect-error the button layout has a fixed size
	size: 'lg',
}

const _LayoutButtonNoLabelPosition: Field.Props = {
	id: 'a', children, layout: 'button',
	// @ts-expect-error the button layout always puts the label after the control
	labelPosition: 'last',
}

const _LayoutButtonNoIcon: Field.Props = {
	id: 'a', children, layout: 'button',
	// @ts-expect-error the button layout draws no icon
	iconPosition: 'left',
}

const _LayoutKeypad: Field.Props = { id: 'a', children, layout: 'keypad', size: 'lg' }

// @ts-expect-error the keypad layout has no caption
const _LayoutKeypadNoCaption: Field.Props = { id: 'a', children, layout: 'keypad', caption: 'Hint' }

const _LayoutKeypadNoLabelPosition: Field.Props = {
	id: 'a', children, layout: 'keypad',
	// @ts-expect-error the keypad layout hides the label, so its position is moot
	labelPosition: 'first',
}

const _LayoutKeypadNoIcon: Field.Props = {
	id: 'a', children, layout: 'keypad',
	// @ts-expect-error the keypad layout draws no icon
	iconPosition: 'right',
}

// @ts-expect-error an unknown layout name is rejected
const _LayoutUnknown: Field.Props = { id: 'a', children, layout: 'grid' }

// ---- Field.ControlProps itself ----------------------------------------

const _ControlShared: Field.ControlProps = { size: 'sm', type: 'email', unstyled: true }

const _ControlNoRequired: Field.ControlProps = {
	// @ts-expect-error state props belong to <Field>
	required: true,
}

export {}
