import type { APIEmbed, UserFlags } from "https://deno.land/x/discord_api_types@0.37.115/v10.ts"

export type Maybe<T> = T | Record<keyof T, null>

export type Snowflake = `${number}`
export type Timestamp = number
export type Embed = { embed: APIEmbed }
export type User =
	& {
		id: Snowflake
		bot: boolean
		system: boolean
		flags: UserFlags
		username: string
		discriminator: `${number}`
		accentColor: number
		createdTimestamp: Timestamp
		defaultAvatarURL: string
		hexAccentColor: `#${string}`
		tag: `${string}#${number}`
		displayAvatarURL: string
	}
	& Maybe<{
		banner: string
		bannerURL: string
	}>
	& Maybe<{
		avatar: string
		avatarURL: string
	}>

export type Member =
	& User
	& {
		guildId: Snowflake
		joinedTimestamp: Timestamp
		premiumSinceTimestamp: Timestamp | null
		nickname: string | null
		pending: boolean
		communicationDisabledUntilTimestamp: Timestamp | null
		displayName: string
		roles: Snowflake[]
	}

export type Channel = {
	id: Snowflake
	name: string
	createdTimestamp: Timestamp
	messages: Snowflake[]
}
export type GuildChannel = Channel & {
	guildId: Snowflake
}

export type Message =
	& {
		reply(content: string, embed?: Embed): never
		reply(embed?: Embed): never
		reply(content: string | Embed): never
		channelId: Snowflake
	}
	& ({
		guildId: null
		author: User
		channel: Channel
	} | {
		guildId: Snowflake
		author: Member
		channel: GuildChannel
	})

export type Hops = {
	hops: string[]
}
export type Tag = {
	body: string
	name: string
	owner: Snowflake
	args?: string
}

declare global {
	namespace util {
		function dumpTags(): string[]
		function fetchTag(name: string):
			| (Hops | (Tag & Hops))
			| null
		function executeTag(name: string, ...args: string[]): unknown
		function findUsers(filter: string): User[] | Member[]
	}

	const msg: Message
	const tag: Tag
}
