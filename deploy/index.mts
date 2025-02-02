/**
 * Warning: this script requires a Discord user token to perform actions on your behalf.
 * Selfbotting is against the Discord's ToS. Do not actually run this.
 */

import { RESTDeleteAPIChannelMessageResult, RESTPostAPIChannelMessageJSONBody, RESTPostAPIChannelMessageResult } from "https://deno.land/x/discord_api_types@0.37.115/v10.ts"
import { delay } from "jsr:@std/async/delay"
import { api, LEVERET_ID_CHANNEL, RESTPostAPIChannelAttachmentJSONBody, uploadFile } from "./discordCommons.mts"

const TAG_NAME = Deno.args[0]
if (!TAG_NAME) {
	console.error("No tag name")
	Deno.exit(2)
}

const SOURCE_FILE = Deno.args[1]
if (!SOURCE_FILE) {
	console.error("No source file")
	Deno.exit(3)
}

const source = Deno.readFileSync(SOURCE_FILE)

const { id } = await api<
	RESTPostAPIChannelMessageResult,
	RESTPostAPIChannelMessageJSONBody
>("POST", `channels/${LEVERET_ID_CHANNEL}/messages`, {
	content: `%t edit ${TAG_NAME}`,
	attachments: await uploadFile(LEVERET_ID_CHANNEL, `${TAG_NAME}.js`, source),
})

await delay(1500)
await api<RESTDeleteAPIChannelMessageResult>("DELETE", `channels/${LEVERET_ID_CHANNEL}/messages/${id}`)
