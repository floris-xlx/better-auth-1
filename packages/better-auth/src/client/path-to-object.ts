import type {
	BetterAuthClientOptions,
	ClientFetchOption,
} from "@better-auth/core";
import type { BetterFetchResponse } from "@better-fetch/fetch";
import type { Endpoint, InputContext } from "better-call";
import type {
	HasRequiredKeys,
	Prettify,
	UnionToIntersection,
} from "../types/helper";

type KeepNullishFromOriginal<Original, Replaced> =
	| Replaced
	| (undefined extends Original ? undefined : never)
	| (null extends Original ? null : never);

type ReplaceTopLevelField<
	Data,
	Field extends "user" | "session",
	Replaced,
> = Data extends object
	? Field extends keyof Data
	? Omit<Data, Field> & {
		[K in Field]: KeepNullishFromOriginal<Data[K], Replaced>;
	}
	: Data
	: Data;

type ReplaceAuthUserAndSession<
	Data,
	ClientOpts extends BetterAuthClientOptions,
> = ReplaceTopLevelField<
	ReplaceTopLevelField<Data, "user", InferUserFromClient<ClientOpts>>,
	"session",
	InferSessionFromClient<ClientOpts>
>;

type MergeCustomSessionField<
	R extends object,
	Field extends "user" | "session",
	InferType,
> = Field extends keyof R
	? {
		[K in Field]: KeepNullishFromOriginal<
			R[K],
			NonNullable<R[K]> & InferType
		>;
	}
	: {};

type MergeCustomSessionWithInferred<
	R,
	ClientOpts extends BetterAuthClientOptions,
> = R extends object
	? Omit<R, "user" | "session"> &
	MergeCustomSessionField<R, "user", InferUserFromClient<ClientOpts>> &
	MergeCustomSessionField<R, "session", InferSessionFromClient<ClientOpts>>
	: never;

type RefineAuthResponse<
	Data,
	ClientOpts extends BetterAuthClientOptions,
> = Data extends { token: unknown } | { redirect: unknown }
	? // Only auth-like responses should get client-side user/session type refinement.
	ReplaceAuthUserAndSession<Data, ClientOpts>
	: Data;

export type CamelCase<S extends string> =
	S extends `${infer P1}-${infer P2}${infer P3}`
	? `${Lowercase<P1>}${Uppercase<P2>}${CamelCase<P3>}`
	: Lowercase<S>;

export type PathToObject<
	T extends string,
	Fn,
> = T extends `/${infer Segment}/${infer Rest}`
	? { [K in CamelCase<Segment>]: PathToObject<`/${Rest}`, Fn> }
	: T extends `/${infer Segment}`
	? { [K in CamelCase<Segment>]: Fn }
	: {};

export type InferSignUpEmailCtx<
	ClientOpts extends BetterAuthClientOptions,
	FetchOptions extends ClientFetchOption,
> = {
	email: string;
	name: string;
	password: string;
	image?: string | undefined;
	callbackURL?: string | undefined;
	fetchOptions?: FetchOptions | undefined;
} & UnionToIntersection<InferAdditionalFromClient<ClientOpts, "user", "input">>;

export type InferSignInEmailCtx<
	ClientOpts extends BetterAuthClientOptions,
	FetchOptions extends ClientFetchOption,
> = {
	email: string;
	password: string;
	callbackURL?: string | undefined;
	rememberMe?: boolean | undefined;
	fetchOptions?: FetchOptions | undefined;
};

export type InferSignInSocialCtx<
	ClientOpts extends BetterAuthClientOptions,
	FetchOptions extends ClientFetchOption,
> = {
	provider: string;
	callbackURL?: string | undefined;
	newUserCallbackURL?: string | undefined;
	errorCallbackURL?: string | undefined;
	disableRedirect?: boolean | undefined;
	idToken?: {
		token: string;
		nonce?: string | undefined;
		accessToken?: string | undefined;
		refreshToken?: string | undefined;
		expiresAt?: number | undefined;
		user?: {
			name?: { firstName?: string; lastName?: string };
			email?: string;
		};
	};
	scopes?: string[] | undefined;
	requestSignUp?: boolean | undefined;
	loginHint?: string | undefined;
	additionalData?: Record<string, any> | undefined;
	fetchOptions?: FetchOptions | undefined;
};

export type InferUserUpdateCtx<
	ClientOpts extends BetterAuthClientOptions,
	FetchOptions extends ClientFetchOption,
> = {
	image?: (string | null) | undefined;
	name?: string | undefined;
	fetchOptions?: FetchOptions | undefined;
} & Partial<UnionToIntersection<InferAdditionalFromClient<ClientOpts, "user", "input">>>;

export type InferResetPasswordCtx<
	ClientOpts extends BetterAuthClientOptions,
	FetchOptions extends ClientFetchOption,
> = {
	newPassword: string;
	token?: string | undefined;
	fetchOptions?: FetchOptions | undefined;
};

export type InferChangePasswordCtx<
	ClientOpts extends BetterAuthClientOptions,
	FetchOptions extends ClientFetchOption,
> = {
	newPassword: string;
	currentPassword?: string | undefined;
	revokeOtherSessions?: boolean | undefined;
	fetchOptions?: FetchOptions | undefined;
};

export type InferSetPasswordCtx<
	ClientOpts extends BetterAuthClientOptions,
	FetchOptions extends ClientFetchOption,
> = {
	newPassword: string;
	fetchOptions?: FetchOptions | undefined;
};

export type InferVerifyEmailCtx<
	ClientOpts extends BetterAuthClientOptions,
	FetchOptions extends ClientFetchOption,
> = {
	token: string;
	callbackURL?: string | undefined;
	fetchOptions?: FetchOptions | undefined;
};

export type InferSendVerificationEmailCtx<
	ClientOpts extends BetterAuthClientOptions,
	FetchOptions extends ClientFetchOption,
> = {
	email: string;
	callbackURL?: string | undefined;
	fetchOptions?: FetchOptions | undefined;
};

export type InferChangeEmailCtx<
	ClientOpts extends BetterAuthClientOptions,
	FetchOptions extends ClientFetchOption,
> = {
	newEmail: string;
	callbackURL?: string | undefined;
	fetchOptions?: FetchOptions | undefined;
};

export type InferListSessionsCtx<
	ClientOpts extends BetterAuthClientOptions,
	FetchOptions extends ClientFetchOption,
> = {
	fetchOptions?: FetchOptions | undefined;
};

export type InferRevokeSessionCtx<
	ClientOpts extends BetterAuthClientOptions,
	FetchOptions extends ClientFetchOption,
> = {
	token: string;
	fetchOptions?: FetchOptions | undefined;
};

export type InferLinkSocialAccountCtx<
	ClientOpts extends BetterAuthClientOptions,
	FetchOptions extends ClientFetchOption,
> = {
	provider: string;
	callbackURL?: string | undefined;
	fetchOptions?: FetchOptions | undefined;
};

export type InferUnlinkAccountCtx<
	ClientOpts extends BetterAuthClientOptions,
	FetchOptions extends ClientFetchOption,
> = {
	providerId: string;
	fetchOptions?: FetchOptions | undefined;
};

export type InferDeleteUserCtx<
	ClientOpts extends BetterAuthClientOptions,
	FetchOptions extends ClientFetchOption,
> = {
	callbackURL?: string | undefined;
	fetchOptions?: FetchOptions | undefined;
};

export type InferAccountInfoCtx<
	ClientOpts extends BetterAuthClientOptions,
	FetchOptions extends ClientFetchOption,
> = {
	accountId?: string | undefined;
	fetchOptions?: FetchOptions | undefined;
};

export type InferUpdateSessionCtx<
	ClientOpts extends BetterAuthClientOptions,
	FetchOptions extends ClientFetchOption,
> = {
	fetchOptions?: FetchOptions | undefined;
} & Partial<UnionToIntersection<InferAdditionalFromClient<ClientOpts, "session", "input">>>;

export type InferRefreshTokenCtx<
	ClientOpts extends BetterAuthClientOptions,
	FetchOptions extends ClientFetchOption,
> = {
	fetchOptions?: FetchOptions | undefined;
};

export type InferGetAccessTokenCtx<
	ClientOpts extends BetterAuthClientOptions,
	FetchOptions extends ClientFetchOption,
> = {
	accountId: string;
	providerId: string;
	fetchOptions?: FetchOptions | undefined;
};

type CoreCtxMap<
	COpts extends BetterAuthClientOptions,
	FetchOptions extends ClientFetchOption,
	C extends InputContext<any, any, any, any, any, any>,
> = {
	"/sign-up/email": InferSignUpEmailCtx<COpts, FetchOptions>;
	"/sign-in/email": InferSignInEmailCtx<COpts, FetchOptions>;
	"/sign-in/social": InferSignInSocialCtx<COpts, FetchOptions>;
	"/update-user": InferUserUpdateCtx<COpts, FetchOptions>;
	"/reset-password": InferResetPasswordCtx<COpts, FetchOptions>;
	"/change-password": InferChangePasswordCtx<COpts, FetchOptions>;
	"/set-password": InferSetPasswordCtx<COpts, FetchOptions>;
	"/verify-email": InferVerifyEmailCtx<COpts, FetchOptions>;
	"/send-verification-email": InferSendVerificationEmailCtx<COpts, FetchOptions>;
	"/change-email": InferChangeEmailCtx<COpts, FetchOptions>;
	"/list-sessions": InferListSessionsCtx<COpts, FetchOptions>;
	"/revoke-session": InferRevokeSessionCtx<COpts, FetchOptions>;
	"/revoke-sessions": InferListSessionsCtx<COpts, FetchOptions>;
	"/revoke-other-sessions": InferListSessionsCtx<COpts, FetchOptions>;
	"/link-social-account": InferLinkSocialAccountCtx<COpts, FetchOptions>;
	"/list-accounts": InferListSessionsCtx<COpts, FetchOptions>;
	"/unlink-account": InferUnlinkAccountCtx<COpts, FetchOptions>;
	"/delete-user": InferDeleteUserCtx<COpts, FetchOptions>;
	"/account-info": InferAccountInfoCtx<COpts, FetchOptions>;
	"/update-session": InferUpdateSessionCtx<COpts, FetchOptions>;
	"/refresh-token": InferRefreshTokenCtx<COpts, FetchOptions>;
	"/get-access-token": InferGetAccessTokenCtx<COpts, FetchOptions>;
};

type RefineCoreCtx<
	TPath extends string,
	COpts extends BetterAuthClientOptions,
	FetchOptions extends ClientFetchOption,
	C extends InputContext<any, any, any, any, any, any>,
> = TPath extends keyof CoreCtxMap<COpts, FetchOptions, C>
	? CoreCtxMap<COpts, FetchOptions, C>[TPath]
	: InferCtx<C, FetchOptions>;

type InferCtxQuery<
	C extends InputContext<any, any, any, any, any, any>,
	FetchOptions extends ClientFetchOption,
> = 0 extends 1 & C["query"]
	? { query?: Record<string, any>; fetchOptions?: FetchOptions }
	: [C["query"]] extends [Record<string, any>]
	? { query: C["query"]; fetchOptions?: FetchOptions }
	: [C["query"]] extends [Record<string, any> | undefined]
	? { query?: C["query"]; fetchOptions?: FetchOptions }
	: { fetchOptions?: FetchOptions };

export type InferCtx<
	C extends InputContext<any, any, any, any, any, any>,
	FetchOptions extends ClientFetchOption,
> = 0 extends 1 & C["body"]
	? InferCtxQuery<C, FetchOptions>
	: [C["body"]] extends [Record<string, any>]
	? C["body"] & { fetchOptions?: FetchOptions }
	: InferCtxQuery<C, FetchOptions>;

export type InferRoute<API, COpts extends BetterAuthClientOptions> =
	API extends Record<string, unknown>
	? {
		[K in keyof API]: API[K] extends Endpoint<
			any, any, any, any, any, infer R, infer Meta, infer ErrorSchema
		>
		? [Meta] extends [{ isAction: false } | { scope: "server" } | { SERVER_ONLY: true } | { scope: "http" }]
		? {}
		: PathToObject<
			API[K] extends { path: infer P extends string } ? P : never,
			API[K] extends (ctx: infer _C) => any
			? _C extends InputContext<any, any, any, any, any, any>
			? <FetchOptions extends ClientFetchOption<any, any, any>>(
				...args: [HasRequiredKeys<InferCtx<_C, FetchOptions>>] extends [true]
				? [Prettify<RefineCoreCtx<API[K] extends { path: infer P extends string } ? P : never, COpts, FetchOptions, _C>>, FetchOptions?]
				: [Prettify<RefineCoreCtx<API[K] extends { path: infer P extends string } ? P : never, COpts, FetchOptions, _C>>?, FetchOptions?]
			) => Promise<
				BetterFetchResponse<
					Meta extends { CUSTOM_SESSION: boolean }
					? MergeCustomSessionWithInferred<NonNullable<Awaited<R>>, COpts>
					: (API[K] extends { path: infer P } ? P : never) extends "/get-session"
					? any // Refined in vanilla.ts
					: RefineAuthResponse<NonNullable<Awaited<R>>, COpts>,
					0 extends 1 & ErrorSchema ? { code?: string; message?: string } : [ErrorSchema] extends [Record<string, any>] ? ErrorSchema : { code?: string; message?: string },
					FetchOptions["throw"] extends true ? true : COpts["fetchOptions"] extends { throw: true } ? true : false
				>
			>
			: never
			: never
		>
		: {}
	}[keyof API]
	: {};

export type InferRoutes<
	API extends Record<string, unknown>,
	ClientOpts extends BetterAuthClientOptions,
> = UnionToIntersection<InferRoute<API, ClientOpts>>;

export type ProxyRequest = {
	options?: ClientFetchOption<any, any> | undefined;
	query?: any | undefined;
	[key: string]: any;
};

// Helper types from types.ts moved here to avoid circularity
export type StripEmptyObjects<T> = T extends object
	? { [K in keyof T as T[K] extends (Record<string, never> | undefined | null) ? never : K]: T[K] }
	: T;

export type InferAdditionalFromClient<
	Options extends BetterAuthClientOptions,
	Key extends string,
	Format extends "input" | "output" = "output",
> = any; // Will be properly intersected in types.ts later or kept as any for now

export type InferUserFromClient<O extends BetterAuthClientOptions> = any;
export type InferSessionFromClient<O extends BetterAuthClientOptions> = any;
