declare module 'servers.wspace' {
	import { EventEmitter } from 'events';
	import WebSocket from 'ws';
	import { Client as SpaceClient, Guild } from 'servers.space';

	export const version: string;
	export class Client extends EventEmitter {
		constructor(options?: ClientOptions);
		private space?: SpaceClient;
		public options: ClientOptions;
		public pings: number[];
		public ready?: Date;
		private ws: WebSocket;
		public readonly ping: number;
		public readonly readyTimestamp?: number;
		private _debug(...messages): void;
		public close(): void;
		public edit(options: ClientOptions, preset?: boolean): ClientOptions;

		public addListener(event: 'debug', listener: (...messages: string[]) => void): this;
		public addListener(event: 'join', listener: (contents: JoinContents) => void): this;
		public addListener(event: 'raw', listener: (data: object) => void): this;
		public addListener(event: 'ready', listener: (readyAt: Date) => void): this;
		public addListener(event: 'upvote', listener: (contents: UpvoteContents) => void): this;
		public addListener(event: 'view', listener: (contents: ViewContents) => void): this;
		public on(event: 'debug', listener: (...messages: string[]) => void): this;
		public on(event: 'join', listener: (contents: JoinContents) => void): this;
		public on(event: 'raw', listener: (data: object) => void): this;
		public on(event: 'ready', listener: (readyAt: Date) => void): this;
		public on(event: 'upvote', listener: (contents: UpvoteContents) => void): this;
		public on(event: 'view', listener: (contents: ViewContents) => void): this;
		public once(event: 'debug', listener: (...messages: string[]) => void): this;
		public once(event: 'join', listener: (contents: JoinContents) => void): this;
		public once(event: 'raw', listener: (data: object) => void): this;
		public once(event: 'ready', listener: (readyAt: Date) => void): this;
		public once(event: 'upvote', listener: (contents: UpvoteContents) => void): this;
		public once(event: 'view', listener: (contents: ViewContents) => void): this;
	}

	type ClientOptions = {
		fetch?: boolean,
		ignoreEvents?: number[],
		raw?: boolean,
		tokens: string[],
	};

	type ViewContents = {
		timestamp: number,
		guildID: string,
		guild?: Guild,
	};

	type JoinContents = {
		timestamp: number,
		guildID: string,
		guild?: Guild,
	};

	type UpvoteContents = {
		timestamp: number,
		guildID: string,
		guild?: Guild,
		user: PartialUser | object,
		userID: string,
	}
}

declare class PartialUser {
	constructor(obj: object);
	public avatar: string;
	public discriminator: string;
	public id: string;
	public username: string;
	public readonly page: string;
	public readonly tag: string;
	public toString(): string;
}