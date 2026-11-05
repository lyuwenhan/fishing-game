export default function createFunctions() {
	function listToChoice(...lists) {
		return [lists].flat(2).map((name, index) => `${index+1}. ${capitalize(name)}`).join(", ")
	}

	function isNumberBetween(num, l, r) {
		return !Number.isFinite(num) || num >= l && num <= r
	}
	async function sleep(time) {
		return new Promise(resolve => setTimeout(resolve, (Number.isFinite(time) && time > 0 ? time : 0) * 1e3))
	}

	function capitalize(text) {
		if (!text) {
			return ""
		}
		return text[0].toUpperCase() + text.slice(1)
	}

	function random(l, r) {
		return Math.floor(Math.random() * (r - l + 1)) + l
	}

	function isPlainObject(value) {
		if (value === null || typeof value !== "object") {
			return false
		}
		const proto = Object.getPrototypeOf(value);
		return proto === Object.prototype || proto === null
	}

	function deepFreeze(value) {
		const seen = new WeakSet;

		function freeze(value) {
			if (value === null || typeof value !== "object" && typeof value !== "function") {
				return value
			}
			if (!Object.isExtensible(value) || seen.has(value)) {
				return value
			}
			seen.add(value);
			for (const key of Reflect.ownKeys(value)) {
				const descriptor = Object.getOwnPropertyDescriptor(value, key);
				if (!descriptor) {
					continue
				}
				if ("value" in descriptor) {
					freeze(descriptor.value)
				}
			}
			return Object.freeze(value)
		}
		return freeze(value)
	}

	function deepCopy(obj) {
		if (obj === null || typeof obj !== "object") {
			return obj
		}
		if (Array.isArray(obj)) {
			return obj.map(item => deepCopy(item))
		}
		const result = {};
		for (const key of Object.keys(obj)) {
			result[key] = deepCopy(obj[key])
		}
		return result
	}

	function deepMerge(...items) {
		function merge(items) {
			items = items.filter(item => item !== undefined && item !== null);
			if (items.length === 0) {
				return items[0]
			}
			if (items.length === 1) {
				return items[0]
			}
			if (isPlainObject(items[0])) {
				const keys = [...new Set(items.filter(item => isPlainObject(item)).map(item => Object.keys(item)).flat())];
				const result = {};
				for (const key of keys) {
					result[key] = merge(items.map(item => item[key]))
				}
				return result
			} else {
				return items[0]
			}
		}
		return merge(items.map(item => deepCopy(item)))
	}

	function clamp(value, min, max, fallback = min) {
		const numberValue = Number(value);
		if (Number.isNaN(numberValue)) {
			return fallback
		}
		return Math.min(max, Math.max(min, numberValue))
	}

	function clampInt(value, min, max, fallback = min) {
		const numberValue = Number(value);
		if (Number.isNaN(numberValue)) {
			return fallback
		}
		return Math.min(max, Math.max(min, Math.trunc(numberValue)))
	}
	return Object.freeze({
		listToChoice,
		isNumberBetween,
		sleep,
		capitalize,
		random,
		isPlainObject,
		deepFreeze,
		deepCopy,
		deepMerge,
		clamp,
		clampInt
	})
}
