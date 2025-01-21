import type {} from "../global.d.ts"

msg.reply((() => {
	const filter = tag.args
	if (!filter) {
		return "❌ No search filter specified"
	}
	const users = util.findUsers(filter).slice(0, 25)
	if (!users.length) {
		return "⚠️ No users match the filter"
	}
	return {
		embed: {
			description: "✔️ **Found the following users:**\n",
			fields: users.map((u) => ({
				name: u.username,
				value: `<@${u.id}> (${u.id})`,
			})),
		},
	}
})())
