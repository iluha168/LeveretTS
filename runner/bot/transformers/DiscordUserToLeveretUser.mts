import { avatarUrl, bannerUrl, memberAvatarUrl } from "discordeno"
import { Member, User } from "../../../typings/leveret.d.ts"
import type { bot } from "../index.mts"

export const DiscordUserToLeveretUser = (user: typeof bot.transformers.$inferredTypes.user): User => ({
	id: `${user.id}`,
	bot: user.bot,
	system: user.system,
	flags: user.publicFlags?.bitfield ?? 0,
	username: user.username,
	discriminator: user.discriminator as User["discriminator"],
	accentColor: user.accentColor ?? 0,
	createdTimestamp: Date.now(),
	defaultAvatarURL: avatarUrl(user.id, user.discriminator),
	hexAccentColor: `#${(user.accentColor ?? 0).toString(16).padStart(6, "0")}`,
	tag: user.tag as User["tag"],
	displayAvatarURL: avatarUrl(user.id, user.discriminator, { avatar: user.avatar }),
	...(user.avatar
		? {
			avatar: user.avatar.toString(16),
			avatarURL: avatarUrl(user.id, user.discriminator, { avatar: user.avatar }),
		}
		: {
			avatar: null,
			avatarURL: null,
		}),
	...(user.banner
		? {
			banner: user.banner.toString(16),
			bannerURL: bannerUrl(user.id, { banner: user.banner })!,
		}
		: {
			banner: null,
			bannerURL: null,
		}),
})

export const DiscordMemberToLeveretMember = (member: typeof bot.transformers.$inferredTypes.member): Member => {
	const user = DiscordUserToLeveretUser(member.user!)
	if (member.avatar) {
		user.avatar = member.avatar.toString(16)
		user.avatarURL = memberAvatarUrl(member.guildId, member.user!.id, { avatar: member.avatar })!
	}
	if (member.banner) {
		user.banner = member.banner.toString(16)
		user.bannerURL = bannerUrl(member.user!.id, { banner: member.banner })!
	}
	return {
		...user,
		guildId: `${member.guildId}`,
		joinedTimestamp: member.joinedAt,
		premiumSinceTimestamp: member.premiumSince ?? null,
		nickname: member.nick ?? null,
		pending: !!member.pending,
		communicationDisabledUntilTimestamp: member.communicationDisabledUntil ?? null,
		displayName: member.nick ?? member.user?.globalName ?? member.user?.username ?? "",
		roles: member.roles.map((id) => `${id}` as const),
	}
}
