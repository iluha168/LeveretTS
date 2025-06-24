import { load } from "jsr:@std/dotenv@^0.225.5"
import { parseEnv } from "jsr:@keawade/zod-env@^0.1.2"
import { z } from "npm:zod@3"

import { Client } from "https://deno.land/x/mysql@v2.12.1/mod.ts"

const rel = (path: string) => import.meta.resolve(path).slice("file://".length)

await load({
	envPath: rel("./.env"),
	export: true,
})

const env = parseEnv(z.strictObject({
	DB_HOSTNAME: z.string(),
	DB_USERNAME: z.string(),
	DB_PASSWORD: z.string(),
}))

export const db = await new Client().connect({
	hostname: env.DB_HOSTNAME,
	username: env.DB_USERNAME,
	password: env.DB_PASSWORD,
	db: "leveret",
	charset: "utf8mb4",
})

await db.transaction(async (t) => {
	const initStatements = await Deno.readTextFile(rel("./init.sql"))
	for (const line of initStatements.split(";\n")) {
		if (line) {
			await t.execute(line)
		}
	}
})
