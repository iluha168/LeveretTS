import type {} from "../typings/tagEvalContext.d.ts"
import { parseArgsParams } from "./lib/cli.mts"
import { throwReply } from "./lib/throwReply.mts"

throwReply(() => {
	parseArgsParams([], [], "Returns a link to the oldest message Leveret has in cache.")
	throw `I remember https://discord.com/channels/${msg.guildId}/${msg.channelId}/${msg.channel.messages[0]}`
})
