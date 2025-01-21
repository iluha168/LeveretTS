/**
 * Warning: this script requires a Discord user token to perform actions on your behalf.
 * Selfbotting is against the Discord's ToS. Do not actually run this.
 */

import { RESTDeleteAPIChannelMessageResult, RESTPostAPIChannelMessageJSONBody, RESTPostAPIChannelMessageResult } from "https://deno.land/x/discord_api_types@0.37.115/v10.ts"
import "jsr:@std/dotenv/load"
import { toText } from "jsr:@std/streams/to-text"
import { delay } from "jsr:@std/async/delay"

const TOKEN = Deno.env.get("USER_TOKEN")!
if (!TOKEN) {
	console.error("No env")
	Deno.exit(1)
}

const TAG_NAME = Deno.args[0]
if (!TAG_NAME) {
	console.error("No tag name")
	Deno.exit(2)
}

const LEVERET_ID = "1311038077313220780"

async function api<Res, Req = undefined>(
	method: "GET" | "POST" | "DELETE" | "PATCH",
	path: string,
	body?: Req,
): Promise<Res> {
	const res = await fetch("https://discord.com/api/v9/" + path, {
		headers: {
			"Authorization": TOKEN,
			"Origin": "https://discord.com",
			"Referer": "https://discord.com/channels/@me/" + LEVERET_ID,
			...(body
				? {
					"Content-Type": "application/json",
				}
				: {}),
		},
		method,
		body: body ? JSON.stringify(body) : undefined,
	})

	const resBody = method === "DELETE" ? null : await res.json()

	if (res.ok) {
		return resBody
	}
	throw new Error(
		`${method} ${path} ${JSON.stringify(body)} -> ${JSON.stringify(resBody)}`,
	)
}

const { id } = await api<
	RESTPostAPIChannelMessageResult,
	RESTPostAPIChannelMessageJSONBody
>("POST", `channels/${LEVERET_ID}/messages`, {
	content: "%t edit " + TAG_NAME + " ```js\n" + await toText(Deno.stdin.readable) + "```",
})

await delay(3000)
await api<RESTDeleteAPIChannelMessageResult>("DELETE", `channels/${LEVERET_ID}/messages/${id}`)
