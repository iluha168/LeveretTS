/**
 * Warning: this script requires a Discord user token to perform actions on your behalf.
 * Selfbotting is against the Discord's ToS. Do not actually run this.
 */

import { RESTDeleteAPIChannelMessageResult, RESTPostAPIChannelMessageJSONBody, RESTPostAPIChannelMessageResult } from "https://deno.land/x/discord_api_types@0.37.115/v10.ts"
import { toText } from "jsr:@std/streams/to-text"
import { delay } from "jsr:@std/async/delay"
import { api, LEVERET_ID } from "./discordCommons.mts"

const TAG_NAME = Deno.args[0]
if (!TAG_NAME) {
	console.error("No tag name")
	Deno.exit(2)
}

const { id } = await api<
	RESTPostAPIChannelMessageResult,
	RESTPostAPIChannelMessageJSONBody
>("POST", `channels/${LEVERET_ID}/messages`, {
	content: "%t edit " + TAG_NAME + " ```js\n" + await toText(Deno.stdin.readable) + "```",
})

await delay(3000)
await api<RESTDeleteAPIChannelMessageResult>("DELETE", `channels/${LEVERET_ID}/messages/${id}`)
