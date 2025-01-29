import { UserFlags } from "https://deno.land/x/discord_api_types@0.37.115/v10.ts"
import type { Embed, EvalContext, Message } from "../typings/leveret.d.ts"
import { tags } from "./dbReader.mts"

export const defaultMsg = {
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
} satisfies Message

export const defaultUtil = {
	dumpTags() {
		return tags.keys().toArray()
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

			const { alias } = tag
			if (hops.includes(alias)) {
				const chain = hops.concat([alias]).map((n) => `**${n}**`).join(" -> ")
				throw new Error(`Epic recursion error: ${chain}.`)
			}
			hops.push(alias)
			tag = tags.get(alias)
		}
		return structuredClone(Object.assign(
			Object.create(null),
			tag,
			{ hops, name },
		))
	},
	findUsers(filter: string) {
		return [defaultMsg.author].filter((u) => u.tag.includes(filter))
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
			} satisfies EvalContext,
			match[2],
		)
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
		} satisfies EvalContext,
	)
	import("../" + tagSource)
}
