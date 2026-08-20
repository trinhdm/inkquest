
const shallowEqual = (a: Partial<object>, b: Partial<object>): boolean => {
	const aKeys = Object.keys(a) as (keyof typeof a)[]
	const bKeys = Object.keys(b)

	return aKeys.length === bKeys.length &&
		aKeys.every((key) => Object.is(a[key], (b as Record<string, unknown>)[key]))
}

class ComponentDefaultsRegistry {
	#store = new Map<string, Partial<object>>()

	register(name: string, defaults: Partial<object>) {
		const values = this.#store.get(name),
			isRedundant = values !== undefined && shallowEqual(values, defaults)

		if (isRedundant) return
		if (process.env.NODE_ENV !== 'production' && values !== undefined) {
			console.warn(
				`[componentDefaultsRegistry] "${name}" already has registered defaults. ` +
				'Overwriting — check for two components sharing a displayName.'
			)
		}

		this.#store.set(name, defaults)
	}

	resolve<T extends object>(name: string): Partial<T> {
		return (this.#store.get(name) ?? {}) as Partial<T>
	}

	reset(name?: string) {
		if (name) this.#store.delete(name)
		else this.#store.clear()
	}
}

const registry = new ComponentDefaultsRegistry()

// Internal write access — import this path directly. Only factory.tsx should call it.
export const setDefaultProps = registry.register.bind(registry)
// registerComponentDefaults

export const getDefaultProps = <T extends object>(name: string): Partial<T> =>
	registry.resolve<T>(name)

// Test-only: clears registered defaults so tests don't leak state across files.
export const resetComponentDefaults = registry.reset.bind(registry)


// const registry = new Map<string, Partial<object>>()

// export const setDefaultProps = (
// 	name: string,
// 	defaults: Partial<object>
// ) => {
// 	registry.set(name, defaults)
// }

// export const getDefaultProps = <T extends object>(name: string): Partial<T> => (
// 	registry.get(name) ?? {}
// ) as Partial<T>
