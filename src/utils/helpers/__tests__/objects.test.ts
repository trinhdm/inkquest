import {
	deepMerge, deepSetMap, flattenMap, isObject, keyHasValue, pluralizeKeys,
} from '../objects'

describe('isObject', () => {
	it('returns true for a plain object literal', () => {
		expect(isObject({ a: 1 })).toBe(true)
	})

	it('returns true for an empty plain object', () => {
		expect(isObject({})).toBe(true)
	})

	it('returns false for an array', () => {
		expect(isObject([1, 2])).toBe(false)
	})

	it('returns false for null', () => {
		expect(isObject(null)).toBe(false)
	})

	it('returns false for undefined', () => {
		expect(isObject(undefined)).toBe(false)
	})

	it('returns false for a string', () => {
		expect(isObject('object')).toBe(false)
	})

	it('returns false for a Map instance', () => {
		expect(isObject(new Map())).toBe(false)
	})

	it('returns false for a class instance whose constructor is not Object', () => {
		class Custom {}
		expect(isObject(new Custom())).toBe(false)
	})
})

describe('keyHasValue', () => {
	it('returns true when the key exists with a truthy value (single-key form)', () => {
		expect(keyHasValue({ active: true }, 'active')).toBe(true)
	})

	it('returns false when the key exists but its value is falsy (single-key form)', () => {
		expect(keyHasValue({ active: false }, 'active')).toBe(false)
	})

	it('returns false when the key is absent entirely', () => {
		expect(keyHasValue({ other: 1 }, 'active')).toBe(false)
	})

	it('returns false when the target is undefined', () => {
		expect(keyHasValue(undefined, 'active')).toBe(false)
	})

	it('returns false when the target is an array, since isObject rejects arrays', () => {
		expect(keyHasValue([1, 2] as any, 'length' as any)).toBe(false)
	})

	it('returns true when the entry-object form matches the exact value', () => {
		expect(keyHasValue({ size: 'sm' }, { size: 'sm' })).toBe(true)
	})

	it('returns false when the entry-object form value does not strictly match', () => {
		expect(keyHasValue({ size: 'sm' }, { size: 'lg' })).toBe(false)
	})

	it('falls back to a truthiness check, not strict-null-equality, when the entry value is explicitly null', () => {
		// v === null routes to the `!!obj[k]` branch instead of comparing obj[k] === null
		expect(keyHasValue({ size: 'sm' }, { size: null as any })).toBe(true)
		expect(keyHasValue({ size: '' }, { size: null as any })).toBe(false)
	})

	it('returns false for the entry-object form when the key does not exist on the object', () => {
		expect(keyHasValue({ other: 1 }, { size: 'sm' })).toBe(false)
	})

	it('treats an own key with value undefined as present but falsy', () => {
		expect(keyHasValue({ active: undefined }, 'active')).toBe(false)
	})
})

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
		expect(deepMerge({ a: { nested: true } }, { a: 'flat' as any })).toEqual({ a: 'flat' })
	})

	it('takes the obj2 object wholesale when obj1 held a non-object at that key', () => {
		expect(deepMerge({ a: 'flat' as any }, { a: { nested: true } })).toEqual({ a: { nested: true } })
	})

	it('returns an empty object when both inputs are empty', () => {
		expect(deepMerge({}, {})).toEqual({})
	})
})

describe('deepSetMap / flattenMap', () => {
	it('sets a single-level key/value pair that flattenMap surfaces by that key', () => {
		const map = new Map()
		deepSetMap(map, 'a', 'value')

		expect(flattenMap(map)).toEqual({ a: 'value' })
	})

	it('builds a nested Map structure for a multi-key path', () => {
		const map = new Map()
		deepSetMap(map, 'a', 'b', 'value')

		expect(map.get('a')).toBeInstanceOf(Map)
	})

	it('flattens a multi-key path down to a record keyed by the final path segment', () => {
		const map = new Map()
		deepSetMap(map, 'a', 'b', 'value')

		// flattenMap does not prefix keys by their parent path - only the
		// deepest key survives into the flattened record.
		expect(flattenMap(map)).toEqual({ b: 'value' })
	})

	it('reuses an existing nested Map when setting a second value under the same parent key', () => {
		const map = new Map()
		deepSetMap(map, 'a', 'b', 'first')
		deepSetMap(map, 'a', 'c', 'second')

		expect(flattenMap(map)).toEqual({ b: 'first', c: 'second' })
	})

	it('overwrites a previously flattened key when two different branches share the same leaf key name', () => {
		const map = new Map()
		deepSetMap(map, 'a', 'x', 'from-a')
		deepSetMap(map, 'b', 'x', 'from-b')

		// Both paths terminate in a leaf keyed 'x'; flattenMap has no path
		// prefixing, so the second write silently clobbers the first.
		expect(flattenMap(map)).toEqual({ x: 'from-b' })
	})

	it('mutates and returns the same map instance it was given', () => {
		const map = new Map()
		const result = deepSetMap(map, 'a', 'value')

		expect(result).toBe(map)
	})

	it('flattens an empty map to an empty object', () => {
		expect(flattenMap(new Map())).toEqual({})
	})
})
