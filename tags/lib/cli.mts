import type {} from "../../typings/tagEvalContext.d.ts"

/**
 * Parses command options and return what's left
 */
export function parseArgsParams(
	mainArgDesc: string,
	options: Record<string, () => void>,
	regexOptions: [RegExp, (group: string) => void][] = [],
): string[] {
	const args = tag.args?.split(/(?<!\\) /g) ?? []
	for (;; args.shift()) {
		const arg = args[0]?.replaceAll("\\ ", " ")

		if (!arg) {
			throw `%t ${tag.name} ${Object.keys(options).map((k) => `[${k}]`).join(" ")} ${mainArgDesc}`
		}

		if (arg in options) {
			options[arg]()
			continue
		}

		const [regex, action] = regexOptions.find(([regex]) => arg.match(regex)) ?? []
		if (regex && action) {
			const match = arg.match(regex)
			if (match && match.length) {
				action(match[1])
				continue
			}
		}

		return args
	}
}
