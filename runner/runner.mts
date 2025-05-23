import { UserFlags } from "https://deno.land/x/discord_api_types@0.37.115/v10.ts"
import type { Embed, EvalContext, Http, Message, Util } from "../typings/leveret.d.ts"
import { tags } from "./dbReader.mts"
import { levenshteinDistance } from "jsr:@alg/levenshtein"

export const defaultMsg: Message = {
	id: "420",
	reference: null,
	content: "bla bla",
	guildId: null,
	channelId: "420",
	reply(content: string | Embed, embed?: Embed) {
		if (typeof content !== "string") {
			content = JSON.stringify(content, null, 2)
		}
		console.log(content)
		if (embed) {
			console.log(JSON.stringify(content, null, 2))
		}
		Deno.exit(0)
	},
	author: {
		id: "420",
		accentColor: 0x00FF00,
		hexAccentColor: "#00ff00",
		avatar: null,
		avatarURL: null,
		banner: null,
		bannerURL: null,
		bot: true,
		createdTimestamp: Date.now(),
		defaultAvatarURL: "http://link",
		discriminator: "0",
		displayAvatarURL: "http://avatar.link",
		flags: UserFlags.VerifiedBot,
		system: true,
		tag: "console#0",
		username: "console",
	},
	channel: {
		id: "420",
		name: "console-channel",
		createdTimestamp: Date.now(),
		messages: ["420"],
	},
}

export const defaultUtil: Util = {
	dumpTags() {
		return tags.keys().toArray()
	},
	findTags(targetName) {
		const options = { maxCost: 8, deletion: 6, substitution: 4, insertion: 0.1 }
		return tags
			.keys()
			.map((name) => [name, levenshteinDistance(targetName, name, options) as number] as const)
			.filter(([, distance]) => distance <= 8)
			.toArray()
			.sort(([, a], [, b]) => a - b)
			.splice(0, 50)
			.map(([name]) => name)
	},
	fetchTag(name: string) {
		const hops = [name]
		let tag = tags.get(name)

		for (;;) { // Alias-resolving loop
			if (tag === undefined) {
				return hops.length > 1 ? { hops } : null
			}
			if (!("alias" in tag)) {
				break
			}

			const { alias, args } = tag
			if (hops.includes(alias)) {
				const chain = hops.concat([alias]).map((n) => `**${n}**`).join(" -> ")
				throw new Error(`⚠️ Epic recursion error: ${chain}.`)
			}
			hops.push(alias)
			tag = tags.get(alias)
			if (tag) tag.args ??= args
		}
		return structuredClone(Object.assign(
			Object.create(null),
			tag,
			{ hops, name },
		))
	},
	findUsers() {
		return []
	},
	executeTag(name: string, ...args: string[]) {
		const tag = this.fetchTag(name)
		if (!tag || !("body" in tag)) {
			throw new Error(`Tag ${name} doesn't exist`)
		}

		const match = tag.body.match(/^`{3}([\S]+)?\n([\s\S]+)`{3}$/)
		if (!match?.[2]) return tag.body

		return new Function(
			"code",
			`with(this){return (()=>{"use strict";return eval(code)})()}`,
		).call(
			{
				util: defaultUtil,
				msg: defaultMsg,
				tag: {
					...tag,
					args: args.join(" "),
				},
				http: defaultHttp,
			} satisfies EvalContext,
			match[2],
		)
	},
	fetchMessages() {
		return [defaultMsg]
	},
}

export const defaultHttp: Http = {
	request(req) {
		console.debug(req)
		return { headers: {}, status: 200, statusText: "OK", data: null }
	},
}

if (import.meta.main) {
	const tagSource = Deno.args[0]
	if (!tagSource) {
		console.error("Please provide a source file")
		Deno.exit(1)
	}
	// Debug tag without eval or sandboxing
	Object.assign(
		globalThis,
		{
			util: defaultUtil,
			msg: defaultMsg,
			tag: {
				owner: "0",
				name: tagSource,
				body: Deno.readTextFileSync(tagSource),
				args: Deno.args.slice(1).join(" ") || undefined,
			},
			http: defaultHttp,
		} satisfies EvalContext,
	)
	import("../" + tagSource)
}
