import { capitalize, toKebabCase, toSlug } from '../strings'

describe('capitalize', () => {
	it('uppercases the first letter of a lowercase word', () => {
		expect(capitalize('hello')).toBe('Hello')
	})

	it('leaves an already-capitalized word unchanged', () => {
		expect(capitalize('Hello')).toBe('Hello')
	})

	it('leaves the rest of the string untouched, including internal casing', () => {
		expect(capitalize('hELLO wORLD')).toBe('HELLO wORLD')
	})

	it('handles a single-character string', () => {
		expect(capitalize('a')).toBe('A')
	})

	it('throws on an empty string, since there is no first character to index', () => {
		expect(() => capitalize('')).toThrow()
	})
})

describe('toKebabCase', () => {
	it('converts camelCase to kebab-case', () => {
		expect(toKebabCase('camelCase')).toBe('camel-case')
	})

	it('converts PascalCase to kebab-case without a leading dash', () => {
		expect(toKebabCase('PascalCase')).toBe('pascal-case')
	})

	it('inserts a dash before every uppercase letter, including consecutive ones', () => {
		expect(toKebabCase('ABC')).toBe('a-b-c')
	})

	it('returns an already-lowercase string unchanged', () => {
		expect(toKebabCase('lowercase')).toBe('lowercase')
	})

	it('returns an empty string unchanged', () => {
		expect(toKebabCase('')).toBe('')
	})

	it('leaves non-alphabetic characters untouched aside from the dash insertions', () => {
		expect(toKebabCase('data2Value')).toBe('data2-value')
	})

	it('collapses a compound-component dot so the class name matches the undotted form', () => {
		expect(toKebabCase('Accordion.Title')).toBe('accordion-title')
		expect(toKebabCase('Accordion.Title')).toBe(toKebabCase('AccordionTitle'))
	})

	it('keeps a dot that is not followed by an uppercase letter', () => {
		expect(toKebabCase('St. Louis')).toBe('st. -louis')
	})
})

describe('toSlug', () => {
	it('lowercases and joins words with a dash', () => {
		expect(toSlug('Browse Work')).toBe('browse-work')
	})

	it('lowercases an all-caps acronym without splitting it', () => {
		expect(toSlug('FAQs')).toBe('faqs')
	})

	it('drops accents rather than the letter', () => {
		expect(toSlug('Café')).toBe('cafe')
	})

	it('collapses each run of non-alphanumerics into a single dash', () => {
		expect(toSlug('St. Louis -- Missouri')).toBe('st-louis-missouri')
	})

	it('trims leading and trailing dashes', () => {
		expect(toSlug('  --Hello, World!--  ')).toBe('hello-world')
	})

	it('keeps digits', () => {
		expect(toSlug('Top 10 Artists')).toBe('top-10-artists')
	})

	it('does not split camelCase, unlike toKebabCase', () => {
		expect(toSlug('camelCase')).toBe('camelcase')
	})

	it('returns an empty string when nothing alphanumeric remains', () => {
		expect(toSlug('!!! ---')).toBe('')
		expect(toSlug('')).toBe('')
	})
})
