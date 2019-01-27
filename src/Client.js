const { ClientOpts: ClientOptions } = require('./structures/options.js');
const EventEmitter = require('events');
const PartialUser = require('./structures/PartialUser.js');
const WebSocket = require('ws');

/**
 * @external WebSocket
 * @see https://github.com/websockets/ws/blob/master/lib/websocket.js
 */

const Events = {
	READY: 'ready',
	CLOSE: 'close',
	DEBUG: 'debug',
};

const Codes = {
	'2': 'GUILD_PAGE_VIEW',
	'3': 'GUILD_JOIN',
	'4': 'GUILD_UPVOTE'
};

/**
 * That Client for connecting to the serverlist.space Gateway.
 */
class Client extends EventEmitter {
	/**
	 * @param {ClientOptions} [options={}] Options to pass.
	 */
	constructor(options = {}) {
		super();

		/**
		 * ClientOptions.
		 * @type {ClientOptions}
		 */
		this.options = this.edit(Object.assign(ClientOptions, options), true);

		/**
		 * The time of when the Client successfully establishes a stable connection to the Gateway.
		 * @type {?Date}
		 */
		this.ready = null;

		/**
		 * An array of WebSocket ping speed. To get the avergae ping, check {@link Client#ping}
		 * @type {number[]}
		 */
		this.pings = [];

		/**
		 * The [servers.space](https://npmjs.org/package/servers.space)'s Client instance.
		 * Used for fetching Guilds if [this.options.fetch]({@link ClientOptions#fetch}) is present.
		 */
		this.space = null;

		try {
			const Space = require('servers.space');
			this.space = new Space.Client({ cache: false });
		} catch (e) {
			this._debug('Unable to find servers.space module; Make sure ClientOptions#fetch is set to false...');
		}

		this._debug('Now connecting...');

		/**
		 * The WebSocket itself.
		 * @type {WebSocket}
		 */
		this.ws = new WebSocket('wss://gateway.serverlist.space')
			.on('open', () => {
				this._debug('Successfully connected to serverlist.space Gateway.');

				const body = {
					op: 0,
					t: Date.now(),
					d: {
						tokens: this.options.tokens,
					},
				};

				this.ws.send(JSON.stringify(body));
				this.ws.ping(Date.now());

				this.int = setInterval(() => {
					if (this.ws.readyState !== this.ws.OPEN) {
						this._debug(this.ws.readyState, this.ws.OPEN);
						return clearInterval(this.int);
					}
					this.ws.send(JSON.stringify(body));
					this.ws.ping(Date.now());
					this._debug('WebSocket Ping and Heartbeat Check Performed.');
				}, 45e3);
			})
			.on('message', async data => {
				data = JSON.parse(data);
				this._debug('Received Update From Client');
				this.emit('raw', data);

				for (const i of this.options.ignoreEvents) {
					if (data.op === i) return this._debug(`Event ${i} (${Codes[i]}) Disabled, Won't Emit Event`);
				}

				if (data.op === 2) {
					/**
					 * @typedef {object} ViewContents
					 * @property {Bot} [guild] The guild that was viewed upon by a user.
					 * @property {string} guildID The guild's Discord ID.
					 * @property {number} timestamp The timestamp that the view took place in.
					 */
					const view = {
						timestamp: data.t,
						guild: this.options.fetch
							? await this.space.fetchGuild(data.d.server, { raw: this.options.raw })
							: null,
						guildID: data.d.server,
					};

					this.emit('view', view);
				} else if (data.op === 3) {
					/**
					 * @typedef {object} JoinContents
					 * @property {Guild} [guild] The guild that the user chose to join.
					 * @property {string} guildID The guild's Discord ID.
					 * @property {number} timestamp The timestamp that the join took place.
					 */
					const click = {
						timestamp: data.t,
						guild: this.options.fetch
							? await this.space.fetchGuild(data.d.server, { raw: this.options.raw })
							: null,
						guildID: data.d.server,
					};

					this.emit('join', click);
				} else if (data.op === 4) {
					const upvote = {
						timestamp: data.t,
						guild: this.options.fetch
							? await this.space.fetchGuild(data.d.server, { raw: this.options.raw })
							: null,
						guildID: data.d.server,
						user: this.options.raw ? data.d.user : new PartialUser(data.d.user),
						userID: data.d.user.id,
					};

					this.emit('upvote', upvote);
				}
			})
			.on('error', this._debug)
			.on('close', (code, message) => {
				this.emit(Events.CLOSE, { code: code, message: message });
				clearInterval(this.int);
			})
			.on('pong', data => {
				if (!this.ready) {
					this.ready = new Date();
					this.emit(Events.READY, this.ready);
				}
				const old = parseInt(data.toString());
				const now = Date.now();
				this.pings.push(now - old);
				while (this.pings.length > 3) this.pings.pop();
			});
	}

	/**
	 * The average ping of some of the recent pings performed.
	 * @readonly
	 * @type {?number}
	 */
	get ping() {
		if (!this.pings.length) return null;
		return (this.pings.reduce((a, b) => a + b, 0)) / (this.pings.length);
	}

	/**
	 * The timestamp of when the WebSocket established a stable connection.
	 * @readonly
	 * @type {number}
	 */
	get readyTimestamp() {
		return this.ready ? this.ready.getTime() : null;
	}

	/**
	 * Emits the DEBUG event.
	 * @private
	 * @returns {void}
	 */
	_debug(...messages) {
		this.emit(Events.DEBUG, ...messages);
	}

	/**
	 * Edits the ClientOptions.
	 * @param {ClientOptions} options Options to pass.
	 * @param {boolean} preset When set to true, uses the original ClientOptions to copy upon. Otherwise, uses {@link Client#options}
	 * @returns {ClientOptions}
	 */
	edit(options, preset = false) {
		const opts = Object.assign(preset ? ClientOptions : this.options, options);
		if (typeof opts.raw !== 'boolean') throw new TypeError('options.raw must be boolean.');
		if (typeof opts.fetch !== 'boolean') throw new TypeError('options.fetch must be boolean.');
		if (!Array.isArray(opts.tokens)) throw new TypeError('options.tokens must be an array.');
		if (!opts.tokens.length) throw new SyntaxError('options.tokens must include at least 1 bot token provided from botlist.space.');
		if (opts.tokens.some(i => typeof i !== 'string')) throw new TypeError('options.tokens requires all values to be a string.');
		if (!Array.isArray(options.ignoreEvents)) throw new TypeError('options.ignoreEvents must be an array.');
		if (opts.ignoreEvents.some(i => typeof i !== 'number')) throw new TypeError('options.ignoreEvents requires all values to be a number.');

		this._debug('Edited the Client\'s options.');
		return this.options = opts;
	}

	/**
	 * Closes the WebSocket Gateway.
	 * @returns {void}
	 */
	close() {
		this._debug('Closing the WebSocket Gateway...');
		this.emit(Events.CLOSE, { code: 0, message: 'Client#close()' });
		clearInterval(this.int);
		return this.ws.close();
	}
}

module.exports = Client;