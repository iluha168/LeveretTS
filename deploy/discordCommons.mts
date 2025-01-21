/**
 * Warning: this script requires a Discord user token to perform actions on your behalf.
 * Selfbotting is against the Discord's ToS. Do not actually run this.
 */

import "jsr:@std/dotenv/load"

const TOKEN = Deno.env.get("USER_TOKEN")!
if (!TOKEN) {
	console.error("No env")
	Deno.exit(1)
}

export const LEVERET_ID = "1311038077313220780"

export async function api<Res, Req = undefined>(
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
