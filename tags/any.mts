import type {} from "../typings/tagEvalContext.d.ts"

const all = util.dumpTags()
const chosen = all[Math.floor(Math.random() * all.length)]
util.executeTag(chosen, tag.args ?? "")
