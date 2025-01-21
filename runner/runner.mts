import { UserFlags } from "https://deno.land/x/discord_api_types@0.37.115/v10.ts"
import type { Message, Tag } from "../global.d.ts"

const tagSource = Deno.args[0]
if (!tagSource) {
	console.error("Please provide a source file")
	Deno.exit(1)
}

import { tags } from "./dbReader.mts"

globalThis.util = {
	dumpTags() {
		return tags.keys().toArray()
	},
	fetchTag(name: string) {
		const hops = [name]
		let tag = tags.get(name)

		for (;;) { // Alias-resolving loop
			if (tag === undefined) {
				return hops.length ? { hops } : null
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
		return [msg.author].filter((u) => u.tag.includes(filter))
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
		).call({
			...globalThis,
			tag: {
				...tag,
				args: args.join(" "),
			},
		}, match[2])
	},
}

//@ts-ignore Global const
globalThis.tag = {
	body: Deno.readTextFileSync(tagSource),
	name: tagSource,
	owner: "420",
	args: Deno.args.slice(1).join(" ") || undefined,
} satisfies Tag

//@ts-ignore Global const
globalThis.msg = {
	guildId: null,
	channelId: "420",
	reply(...args: unknown[]) {
		console.log(...args.map((a) => JSON.stringify(a, null, 2)))
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

import("../" + tagSource)
