/**
 * Warning: this script requires a Discord user token to perform actions on your behalf.
 * Selfbotting is against the Discord's ToS. Do not actually run this.
 * You may use this algorithm as an instruction for manual labour.
 */

/**
 * @module
 * Copies leveret's database part by part.
 */

import {
	RESTGetAPIChannelMessagesResult,
	RESTPatchAPIChannelMessageJSONBody,
	RESTPatchAPIChannelMessageResult,
	RESTPostAPIChannelMessageJSONBody,
	RESTPostAPIChannelMessageResult,
} from "https://deno.land/x/discord_api_types@0.37.115/v10.ts"
import { api, LEVERET_ID_BOT, LEVERET_ID_CHANNEL } from "../deploy/discordCommons.mts"
import { delay } from "jsr:@std/async/delay"
import { Tags } from "../ORM/mod.mts"
import { TagRow } from "../ORM/repository/Tag/row.mts"

// Take an existing message
let { id } = await api<
	RESTPostAPIChannelMessageResult,
	RESTPostAPIChannelMessageJSONBody
>("POST", `channels/${LEVERET_ID_CHANNEL}/messages`, {
	content: "hi",
})

const iStep = 100
for (let i = 0;; i += iStep) {
	// Edit message
	;({ id } = await api<
		RESTPatchAPIChannelMessageResult,
		RESTPatchAPIChannelMessageJSONBody
	>("PATCH", `channels/${LEVERET_ID_CHANNEL}/messages/${id}`, {
		// Ask bot for partial dump
		content: `%t megadump ${i}-${i + iStep}`,
	}))

	// Wait for the bot to respond
	await delay(5000)

	// Check the latest message
	const [latestMessage] = await api<
		RESTGetAPIChannelMessagesResult
	>("GET", `channels/${LEVERET_ID_CHANNEL}/messages?limit=50`)

	// The bot did not respond
	if (latestMessage.author.id !== LEVERET_ID_BOT) {
		break
	}

	// Save to database
	const dump = latestMessage.content || await fetch(latestMessage.attachments[0].url).then((r) => r.text())
	for (const line of dump.split("\n")) {
		if (line) await Tags.save(JSON.parse(line) as TagRow).catch(console.warn)
	}
}

// Delete the original message
await api<RESTPostAPIChannelMessageResult>("DELETE", `channels/${LEVERET_ID_CHANNEL}/messages/${id}`)
