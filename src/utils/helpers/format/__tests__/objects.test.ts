import {
	deepKeys, deepMerge,
	deepSet, flattenMap,
	pluralizeKeys,
} from '../objects'

describe('pluralizeKeys', () => {
	it('appends "s" to every top-level key while keeping values untouched', () => {
		expect(pluralizeKeys({ name: 'Ada', role: 'admin' })).toEqual({
			names: 'Ada',
			roles: 'admin',
		})
	})

	it('returns an empty object when given an empty object', () => {
		expect(pluralizeKeys({})).toEqual({})
	})

	it('does not recurse into nested object values', () => {
		expect(pluralizeKeys({ meta: { count: 1 } })).toEqual({ metas: { count: 1 } })
	})
})

describe('deepMerge', () => {
	it('merges two flat objects, with obj2 taking precedence on shared keys', () => {
		expect(deepMerge({ a: 1, b: 2 }, { b: 3, c: 4 })).toEqual({ a: 1, b: 3, c: 4 })
	})

	it('recursively merges nested plain objects instead of replacing them wholesale', () => {
		const result = deepMerge(
			{ theme: { color: 'red', size: 'sm' } },
			{ theme: { color: 'blue' } }
		)

		expect(result).toEqual({ theme: { color: 'blue', size: 'sm' } })
	})

	it('falls back to the obj1 value when the obj2 value is undefined', () => {
		expect(deepMerge({ a: 1 }, { a: undefined as unknown as number })).toEqual({ a: 1 })
	})

	it('falls back to the obj1 value when the obj2 value is explicitly null', () => {
		expect(deepMerge({ a: 1 }, { a: null as unknown as number })).toEqual({ a: 1 })
	})

	it('keeps a key that only exists on obj1', () => {
		expect(deepMerge({ onlyA: 1 }, {})).toEqual({ onlyA: 1 })
	})

	it('keeps a key that only exists on obj2', () => {
		expect(deepMerge({}, { onlyB: 1 })).toEqual({ onlyB: 1 })
	})

	it('overwrites a nested object in obj1 with a non-object value from obj2', () => {
		expect(deepMerge({ a: { nested: true } }, { a: 'flat' as unknown })).toEqual({ a: 'flat' })
	})

	it('takes the obj2 object wholesale when obj1 held a non-object at that key', () => {
		expect(deepMerge({ a: 'flat' as unknown }, { a: { nested: true } })).toEqual({ a: { nested: true } })
	})

	it('returns an empty object when both inputs are empty', () => {
		expect(deepMerge({}, {})).toEqual({})
	})
})

describe('deepSet / flattenMap', () => {
	it('sets a single-level key/value pair that flattenMap surfaces by that key', () => {
		const map = new Map()
		deepSet(map, 'a', 'value')

		expect(flattenMap(map)).toEqual({ a: 'value' })
	})

	it('builds a nested Map structure for a multi-key path', () => {
		const map = new Map()
		deepSet(map, 'a', 'b', 'value')

		expect(map.get('a')).toBeInstanceOf(Map)
	})

	it('flattens a multi-key path down to a record keyed by the final path segment', () => {
		const map = new Map()
		deepSet(map, 'a', 'b', 'value')

		// flattenMap does not prefix keys by their parent path - only the
		// deepest key survives into the flattened record.
		expect(flattenMap(map)).toEqual({ b: 'value' })
	})

	it('reuses an existing nested Map when setting a second value under the same parent key', () => {
		const map = new Map()
		deepSet(map, 'a', 'b', 'first')
		deepSet(map, 'a', 'c', 'second')

		expect(flattenMap(map)).toEqual({ b: 'first', c: 'second' })
	})

	it('overwrites a previously flattened key when two different branches share the same leaf key name', () => {
		const map = new Map()
		deepSet(map, 'a', 'x', 'from-a')
		deepSet(map, 'b', 'x', 'from-b')

		// Both paths terminate in a leaf keyed 'x'; flattenMap has no path
		// prefixing, so the second write silently clobbers the first.
		expect(flattenMap(map)).toEqual({ x: 'from-b' })
	})

	it('mutates and returns the same map instance it was given', () => {
		const map = new Map()
		const result = deepSet(map, 'a', 'value')

		expect(result).toBe(map)
	})

	it('flattens an empty map to an empty object', () => {
		expect(flattenMap(new Map())).toEqual({})
	})
})

describe('deepKeys', () => {
	it('returns an empty list for an empty object', () => {
		expect(deepKeys({})).toEqual([])
	})

	it('returns the top-level keys of a flat object', () => {
		expect(deepKeys({ a: 1, b: 'x' })).toEqual(['a', 'b'])
	})

	it('joins nested keys with a hyphen', () => {
		expect(deepKeys({ a: { b: 1, c: { d: 2 } }, e: 3 })).toEqual(['a-b', 'a-c-d', 'e'])
	})

	it('starts every key from the given prefix', () => {
		expect(deepKeys({ a: 1, b: { c: 2 } }, 'root')).toEqual(['root-a', 'root-b-c'])
	})

	it('treats arrays and null as leaves rather than descending into them', () => {
		expect(deepKeys({ list: [1, 2], none: null })).toEqual(['list', 'none'])
	})

	it('drops an empty nested object, since it has no leaf to name', () => {
		// positive control: the sibling leaf is still listed
		expect(deepKeys({ empty: {}, leaf: 1 })).toEqual(['leaf'])
	})
})
