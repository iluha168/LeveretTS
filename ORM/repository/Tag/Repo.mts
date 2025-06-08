import { db } from "db"
import { TagRow, zTagRow } from "./row.mts"
import type { TagModel } from "./TagModel.mts"

/**
 * Cache stores ALL of the tags for now
 */
const cache = new Map<TagModel["name"], TagModel>()

// Will become async if the cache no longer stores all tags
// deno-lint-ignore require-await
export async function fetch(name: string) {
	return cache.get(name)
}

export async function save(tagRow: TagRow, affectDB = true) {
	const { error, data: tagModel } = zTagRow.safeParse(tagRow)
	if (error) {
		throw new TypeError(error.issues.map((i) => i.message).join("\n"))
	}
	if (affectDB) {
		const rowPack = [tagRow.name, tagRow.owner, tagRow.type, tagRow.body]
		await db.execute(
			`INSERT INTO Tag(name, owner, type, body) VALUES(?,?,?,?)
			ON DUPLICATE KEY UPDATE name=?,owner=?,type=?,body=?`,
			[...rowPack, ...rowPack],
		)
	}
	cache.set(tagRow.name, tagModel)
}

await db.useConnection(async (conn) => {
	const { iterator: tagRows } = await conn.execute(
		"SELECT * FROM Tag",
		[],
		true,
	)
	for await (const tagRow of tagRows) {
		await save(tagRow, false)
	}
})
