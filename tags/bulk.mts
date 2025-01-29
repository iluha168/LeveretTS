import type {} from "../typings/tagEvalContext.d.ts"

try {
    const args = tag.args?.split(" ")
    if(!args?.length)
        throw "%t bulk <tag name> <tag name> ..."

    msg.reply(args
        .map(name => {
            try {
                const tag = util.fetchTag(name)
                if(tag && "body" in tag)
                    return tag.body
                return `\`%t ${name} does not have text.\``
            } catch {
                return `\`%t ${name} does not exist.\``
            }
        })
        .join("\n")
    )
} catch(e) {
    msg.reply(`${e}`)
}