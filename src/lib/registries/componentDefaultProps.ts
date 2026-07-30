const registry = new Map<string, Partial<object>>()

export const setDefaultProps = (
	name: string,
	defaults: Partial<object>
) => {
	registry.set(name, defaults)
}

export const getDefaultProps = <T extends object>(name: string): Partial<T> => (
	registry.get(name) ?? {}
) as Partial<T>
