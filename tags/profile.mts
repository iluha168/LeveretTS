import { Member, User } from "../typings/leveret.d.ts"
import type {} from "../typings/tagEvalContext.d.ts"

const ts2dc = (ts: number, type?: string) => `<t:${Math.round(ts / 1000)}:${type ?? "F"}>`

msg.reply((() => {
	if (tag.args && !util.findUsers) {
		return "`%t profile <username>` must be used in a server!"
	}
	let me: User | Member | undefined
	if (tag.args) {
		me = util.findUsers?.(tag.args)[0]
	}
	me ??= msg.author
	const discr = me.discriminator === "0" ? "" : ("#" + me.discriminator)
	return {
		embed: {
			author: {
				name: me.username + discr,
				icon_url: me.displayAvatarURL ?? me.defaultAvatarURL,
			},
			color: me.accentColor ?? 0,
			fields: Object.entries({
				"Mention": `<@${me.id}>\n${me.username + discr} (${me.id})`,
				"Color": me.hexAccentColor,
				"Account created": ts2dc(me.createdTimestamp),
				"This server": "guildId" in me
					? [
						"Joined at " + ts2dc(me.joinedTimestamp),
						me.premiumSinceTimestamp &&
						`Server booster since ${ts2dc(me.premiumSinceTimestamp)}`,
						me.nickname && `Nickname: ${me.nickname}`,
						me.pending && `Did not finish joining`,
						me.communicationDisabledUntilTimestamp &&
						me.communicationDisabledUntilTimestamp > Date.now() &&
						`Timeout ends ${ts2dc(me.communicationDisabledUntilTimestamp, "R")}`,
					].filter((_) => _).join("\n")
					: "I am not in a server 🐇",
				"Roles": "roles" in me
					? (me.roles.slice(0, 10).map((i) => `<@&${i}>`).join(
						"\n",
					) || "No roles")
					: "Still not in a server 🐰",
				"Bot?": (me.bot || me.system) ? "Definitely not a bot!!" : "",
			}).filter((kv) => kv[1]).map((kv) => ({
				name: kv[0],
				value: kv[1],
			})),
			image: me.bannerURL
				? {
					url: me.bannerURL,
				}
				: undefined,
			footer: {
				text: "BOTTOM TEXT",
			},
		},
	}
})())
