import type {} from "../../typings/tagEvalContext.d.ts"

const fmtWithBrackets = (array: string[], bracketA: string, bracketB: string) =>
	// deno-fmt-ignore
	array.map(i => bracketA + i + bracketB).join(" ")

/**
 * Parses command options and return what's left
 */
export function parseArgsParams(
	argsRequired: string[],
	argsOptional: string[],
	options: Record<string, () => void> = {},
	regexOptions: [RegExp, (group: string) => void][] = [],
): string[] {
	const help = () => {
		// deno-fmt-ignore
		throw `%t ${tag.name} ${
			fmtWithBrackets(Object.keys(options),'[',']')
		} ${
			fmtWithBrackets(argsRequired, '<', '>')
		} ${
			fmtWithBrackets(argsOptional, '(', ')')
		}`
	}
	options["--help"] = help

	const args = tag.args?.split(/(?<!\\) /g) ?? []
	for (;; args.shift()) {
		const arg = args[0]?.replaceAll("\\ ", " ")

		if (!arg) {
			break
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
		break
	}
	if (args.length < argsRequired.length) {
		help()
	}
	return args
}
