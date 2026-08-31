class VariantStyleRegistry {
	#injected = new Set<string>()
	hasInjected(name: string) {
		if (this.#injected.has(name)) return true
		if (typeof document !== 'undefined' && document.querySelector(`[data-target-vars="${name}"]`)) {
			this.#injected.add(name)
			return true
		}
		return false
	}

	markInjected(name: string) {
		this.#injected.add(name)
	}

	reset(name?: string) {
		if (name) this.#injected.delete(name)
		else this.#injected.clear()
	}
}

class VariantVarRegistry {
	#variables = new Set<string>()

	addVariable(variable: string) {
		// console.log(this.#variables.has(variable), variable, { test: this.#variables.keys() })
		if (!this.#variables.has(variable)) {
			this.#variables.add(variable)
		}
		console.log({ test: this.#variables.keys() })
	}

	getVariables() {
		console.log({ test: this.#variables })
		return [...this.#variables.keys()]
	}
}

const registry = new VariantStyleRegistry()
const varRegistry = new VariantVarRegistry()

export const hasInjectedVariantStyles = registry.hasInjected.bind(registry)
export const markVariantStylesInjected = registry.markInjected.bind(registry)
export const resetVariantStyles = registry.reset.bind(registry)

export const addVariantVariable = varRegistry.addVariable.bind(varRegistry)
export const handleVariantVariables = varRegistry.getVariables.bind(varRegistry)
// export const handleVariantVariables = varRegistry.bind(varRegistry)
