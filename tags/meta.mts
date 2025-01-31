import type {} from "../typings/tagEvalContext.d.ts"
import { parseArgsParams } from "./lib/cli.mts";

const codeSep = "`".repeat(3)
function cropBody(body: string) {
	// Leveret limitation
	let result = body.split("\n").slice(0, 25).join("\n").replaceAll("`", "`")
	const isCode = body.startsWith(codeSep) && body.endsWith(codeSep)
	if (isCode) {
		result = codeSep + result.slice(codeSep.length, -codeSep.length) + codeSep
	}
	// Discord limitation
	if (result.length > 1024) {
		result = result.slice(0, 1024)
		if (isCode) {
			result = result.slice(0, -codeSep.length) + codeSep
		}
	}
	return result
}

function cropToRight(str: string, len: number) {
	return (str.length <= len) ? str : ("…" + str.slice(str.length - len + 1))
}

msg.reply((() => {
	let showPreview = true
	const args = parseArgsParams("<tag name>", {
		"--no-preview": () => showPreview = false
	})
	if (args.length > 1) {
		return "You can only view 1 (one (0!)) tag at a time"
	}
	const [name] = args
	const target = util.fetchTag(name)
	if (!target) {
		return "HTTP 404: https://leveret.com/api/t/" + name
	}

	return {
		embed: {
			title: cropToRight(target.hops.map((ali) => "%t " + ali).join(" -> "), 256),
			fields: "body" in target
				? [{
					name: "Owner",
					value: `<@${target.owner}> (${target.owner})`,
				}, {
					name: "Preview",
					value: showPreview? cropBody(target.body) : "`Omit by flag.`",
				}]
				: [],
		},
	}
})())
