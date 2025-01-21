import type {} from "../global.d.ts"

const all = util.dumpTags()
const chosen = all[Math.floor(Math.random() * all.length)]
util.executeTag(chosen, tag.args ?? "")
