import type {} from "../../typings/tagEvalContext.d.ts"

/**
 * Parses command options and return what's left
 */
export function parseArgsParams(
	mainArgDesc: string,
	options: Record<string, () => void>,
): string[] {
	const args = tag.args?.split(" ") ?? []
	for (;; args.shift()) {
		const [arg] = args

		if (!arg) {
			throw `%t ${tag.name} ${Object.keys(options).map((k) => `[${k}]`).join(" ")} ${mainArgDesc}`
		}

		if (arg in options) {
			options[arg]()
		} else {
			return args
		}
	}
}
