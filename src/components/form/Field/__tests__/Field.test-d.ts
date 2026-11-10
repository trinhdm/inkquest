/**
 * Type-level tests for the Field state contract: the Field wrapper owns
 * `disabled`, `readonly`, `required` (plus `invalid` and `loading`), and the
 * controls (`Field.Input`, `Field.Code`, `Field.Textarea`, `Field.Choice`)
 * reject them through `Field.ControlProps`.
 *
 * Moving keys between the Field types once reopened this gap without any
 * error, so every state prop is pinned per control. The rejections call the
 * control, which is checked the way JSX is: a key dropped from the contract
 * that is also a native attribute (`disabled`, `required`) starts compiling
 * there, while a plain `Props` object would still reject it as unknown.
 * Each `@ts-expect-error` sits on its own line, so a prop that starts
 * compiling shows up as an "unused @ts-expect-error". Compile-time only;
 * `npm run test:types` runs it.
 */
import type { ReactNode } from 'react'
import { Field } from '../Field'

// ---- Field.Input ----------------------------------------------------

const _InputBase: Field.Input.Props = { name: 'a' }

const _InputNoDisabled = () => Field.Input({
	name: 'a',
	// @ts-expect-error state props belong to <Field>
	disabled: true,
})

const _InputNoReadonly = () => Field.Input({
	name: 'a',
	// @ts-expect-error state props belong to <Field>
	readonly: true,
})

const _InputNoRequired = () => Field.Input({
	name: 'a',
	// @ts-expect-error state props belong to <Field>
	required: true,
})

const _InputNoLoading = () => Field.Input({
	name: 'a',
	// @ts-expect-error state props belong to <Field>
	loading: true,
})

const _InputNoInvalid = () => Field.Input({
	name: 'a',
	// @ts-expect-error state props belong to <Field>
	invalid: true,
})

const _InputSize: Field.Input.Props = { name: 'a', size: 'lg' }
const _InputUnstyled: Field.Input.Props = { name: 'a', unstyled: true }
const _InputType: Field.Input.Props = { name: 'a', type: 'email' }

// ---- Field.Code -----------------------------------------------------

const _CodeBase: Field.Code.Props = { name: 'a' }

const _CodeNoDisabled = () => Field.Code({
	name: 'a',
	// @ts-expect-error state props belong to <Field>
	disabled: true,
})

const _CodeNoReadonly = () => Field.Code({
	name: 'a',
	// @ts-expect-error state props belong to <Field>
	readonly: true,
})

const _CodeNoRequired = () => Field.Code({
	name: 'a',
	// @ts-expect-error state props belong to <Field>
	required: true,
})

const _CodeNoLoading = () => Field.Code({
	name: 'a',
	// @ts-expect-error state props belong to <Field>
	loading: true,
})

const _CodeNoInvalid = () => Field.Code({
	name: 'a',
	// @ts-expect-error state props belong to <Field>
	invalid: true,
})

const _CodeSize: Field.Code.Props = { name: 'a', size: 'lg' }
const _CodeUnstyled: Field.Code.Props = { name: 'a', unstyled: true }
const _CodeOwnProps: Field.Code.Props = { name: 'a', length: 4, autoSubmit: true }

// ---- Field.Textarea -------------------------------------------------

const _TextareaBase: Field.Textarea.Props = { name: 'a' }

const _TextareaNoDisabled = () => Field.Textarea({
	name: 'a',
	// @ts-expect-error state props belong to <Field>
	disabled: true,
})

const _TextareaNoReadonly = () => Field.Textarea({
	name: 'a',
	// @ts-expect-error state props belong to <Field>
	readonly: true,
})

const _TextareaNoRequired = () => Field.Textarea({
	name: 'a',
	// @ts-expect-error state props belong to <Field>
	required: true,
})

const _TextareaNoLoading = () => Field.Textarea({
	name: 'a',
	// @ts-expect-error state props belong to <Field>
	loading: true,
})

const _TextareaNoInvalid = () => Field.Textarea({
	name: 'a',
	// @ts-expect-error state props belong to <Field>
	invalid: true,
})

const _TextareaSize: Field.Textarea.Props = { name: 'a', size: 'lg' }
const _TextareaUnstyled: Field.Textarea.Props = { name: 'a', unstyled: true }

// ---- Field.Choice ---------------------------------------------------

const _ChoiceBase: Field.Choice.Props = { name: 'a', value: '1' }

const _ChoiceNoDisabled = () => Field.Choice({
	name: 'a', value: '1',
	// @ts-expect-error state props belong to <Field>
	disabled: true,
})

const _ChoiceNoReadonly = () => Field.Choice({
	name: 'a', value: '1',
	// @ts-expect-error state props belong to <Field>
	readonly: true,
})

const _ChoiceNoRequired = () => Field.Choice({
	name: 'a', value: '1',
	// @ts-expect-error state props belong to <Field>
	required: true,
})

const _ChoiceNoLoading = () => Field.Choice({
	name: 'a', value: '1',
	// @ts-expect-error state props belong to <Field>
	loading: true,
})

const _ChoiceNoInvalid = () => Field.Choice({
	name: 'a', value: '1',
	// @ts-expect-error state props belong to <Field>
	invalid: true,
})

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

// @ts-expect-error an unknown layout name is rejected
const _LayoutUnknown: Field.Props = { id: 'a', children, layout: 'grid' }

// ---- Field.ControlProps itself ----------------------------------------

const _ControlShared: Field.ControlProps = { size: 'sm', type: 'email', unstyled: true }

const _ControlNoRequired: Field.ControlProps = {
	// @ts-expect-error state props belong to <Field>
	required: true,
}

export {}
