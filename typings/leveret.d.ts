import type { APIEmbed, UserFlags } from "https://deno.land/x/discord_api_types@0.38.2/v10.ts"

export type Maybe<T> = T | Record<keyof T, null>

export type Snowflake = `${number | bigint}`
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
		reply(embed: Embed): never
		reply(content: string | Embed): never
		id: Snowflake
		content: string
		channelId: Snowflake

		reference: null | {
			channelId: Snowflake
			messageId: Snowflake
		}
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

export type Util = {
	dumpTags(): string[]
	findTags(name: string): string[]
	fetchTag(name: string):
		| (Hops | (Tag & Hops))
		| null
	executeTag(name: string, ...args: string[]): unknown
	/** Not available outside a guild */
	findUsers?: (filter: string) => Member[]
	fetchMessages(id?: Snowflake): Message[]
}

export type HttpRequest = {
	url: string
	method?: string
	headers?: Record<string, string>
	params?: URLSearchParams | Record<string, number | string | null | undefined>
	data?: FormData | File | Blob | string | ArrayBuffer | ArrayBufferView | URLSearchParams
	timeout?: number
	withCredentials?: boolean
	responseType?: "blob" | "arraybuffer" | "document" | "json" | "text" | "stream"
}
export type HttpResponse = {
	status: number
	statusText: string
	headers: Record<string, string>
	data: unknown
}
export type Http = {
	request(req: string | HttpRequest): HttpResponse
}

export type EvalContext = {
	msg: Message
	tag: Tag
	util: Util
	http: Http
}
