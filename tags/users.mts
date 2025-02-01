import type {} from "../typings/tagEvalContext.d.ts"
import { checkGuild } from "./lib/checkGuild.mts"
import { parseArgsParams } from "./lib/cli.mts"
import { throwReply } from "./lib/throwReply.mts"

throwReply(() => {
	checkGuild(util)
	const filter = parseArgsParams(["mention or ID"], ["..."], "Finds guild members mentioned.").join(" ")
	const users = util.findUsers(filter).slice(0, 25)
	if (!users.length) {
		throw "⚠️ No users match the filter"
	}
	throw {
		embed: {
			description: "✔️ **Found the following users:**\n",
			fields: users.map((u) => ({
				name: u.username,
				value: `<@${u.id}> (${u.id})`,
			})),
		},
	}
})
