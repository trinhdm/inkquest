import { isObject } from '@/utils/helpers'

const SINGULAR_NAMES = ['radius']

const isFontName = (name: string) =>
	name.startsWith('font') && name.includes('-')

const isPlural = (name: string) =>
	name.endsWith('s')
	&& name.length > 2
	&& !(SINGULAR_NAMES.includes(name))

const isVerb = (name: string) =>
	name.endsWith('ing')

const isHexCode = (value: unknown) =>
	/#(?:[0-9a-fA-F]{3}){1,2}\b/.test(`${value}`)

const isNumeric = (value: unknown): boolean =>
	typeof value === 'number'
	|| /\d/.test(`${value}`)
	|| (isObject(value) && Object.values(value).every(v => isNumeric(v)))

const isTagGroup = (value: unknown) =>
	isObject(value) && Object.hasOwn(value, 'tagName') && isObject(value.tagName)

const isSingular = (value: unknown) =>
	_is.TagGroup(value) || _is.HexCode(value) || _is.Numeric(value)

export const _is = {
	FontName:	isFontName,
	HexCode:	isHexCode,
	Numeric:	isNumeric,
	Plural:		isPlural,
	Singular:	isSingular,
	TagGroup:	isTagGroup,
	Verb:		isVerb,
}
