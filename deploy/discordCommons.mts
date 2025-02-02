/**
 * Warning: this script requires a Discord user token to perform actions on your behalf.
 * Selfbotting is against the Discord's ToS. Do not actually run this.
 */

import "jsr:@std/dotenv/load"
import { Snowflake } from "../typings/leveret.d.ts"
import { RESTAPIAttachment } from "https://deno.land/x/discord_api_types@0.37.115/v10.ts"

const TOKEN = Deno.env.get("USER_TOKEN")!
if (!TOKEN) {
	console.error("No env")
	Deno.exit(1)
}

export const LEVERET_ID_CHANNEL = "1311038077313220780"
export const LEVERET_ID_BOT = "708269782482550814"

export async function api<Res, Req = undefined>(
	method: "GET" | "POST" | "DELETE" | "PATCH",
	path: string,
	body?: Req,
): Promise<Res> {
	const res = await fetch("https://discord.com/api/v9/" + path, {
		headers: {
			"Authorization": TOKEN,
			"Origin": "https://discord.com",
			"Referer": "https://discord.com/channels/@me/" + LEVERET_ID_CHANNEL,
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

export type RESTPostAPIChannelAttachmentResult = {
	attachments: {
		id: number
		upload_filename: string
		upload_url: string
	}[]
}

export type RESTPostAPIChannelAttachmentJSONBody = {
	files: {
		filename: string
		file_size: number
		id: string
		is_clip: boolean
	}[]
}

export async function uploadFile(channelID: Snowflake, name: string, data: Uint8Array) {
	const { attachments } = await api<
		RESTPostAPIChannelAttachmentResult,
		RESTPostAPIChannelAttachmentJSONBody
	>("POST", `channels/${channelID}/attachments`, {
		files: [{
			filename: name,
			file_size: data.length,
			id: Math.floor(Math.random() * 100).toString(),
			is_clip: false,
		}],
	})

	const [{ upload_url, upload_filename }] = attachments
	await fetch(upload_url, {
		method: "PUT",
		headers: {
			"Content-Type": "application/octet-stream",
			"Origin": "https://discord.com",
			"Referer": "https://discord.com/",
		},
		body: data,
	})

	return [{
		filename: name,
		id: "0",
		uploaded_filename: upload_filename,
	}]
}
