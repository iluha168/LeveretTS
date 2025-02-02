import type {} from "../../typings/tagEvalContext.d.ts"

const fmtWithBrackets = (array: string[], bracketA: string, bracketB: string) =>
	// deno-fmt-ignore
	array.map(i => bracketA + i + bracketB).join(" ")

/**
 * @param argsRequired Descriptions of required arguments
 * @param argsOptional Descriptions of optional arguments
 * @param description Description of the command
 * @param options Options before arguments and their callbacks
 * @param regexOptions Regex patterns for options before arguments, their descriptions and callbacks
 * @returns Required arguments followed by optional arguments
 */
export function parseArgsParams(
	argsRequired: string[],
	argsOptional: string[],
	description: string,
	options: Record<string, () => void> = {},
	regexOptions: [RegExp, (group: string) => void, string][] = [],
): string[] {
	const help = (prefix = "") => {
		// deno-fmt-ignore
		throw `${prefix}%t ${tag.name} ${
			fmtWithBrackets(Object.keys(options), '[', ']')
		} ${
			fmtWithBrackets(regexOptions.map(i => i[2]), '[', ']')
		} ${
			fmtWithBrackets(argsRequired, '<', '>')
		} ${
			fmtWithBrackets(argsOptional, '(', ')')
		}\n\n${description}`
	}
	options["--help"] = help

	const args = tag.args?.split(/(?<!\\) /g) ?? []
	for (;; args.shift()) {
		const arg = args[0]?.replaceAll("\\ ", " ")

		if (!arg) {
			break
		}

		if (arg === "--") {
			args.shift()
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
		help("Not enough params!\n\n")
	}
	if (argsOptional.length === 0 && args.length > argsRequired.length) {
		help("Too many params!\n\n")
	}
	return args
}
