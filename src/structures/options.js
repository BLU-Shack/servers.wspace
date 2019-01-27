/**
 * @typedef {object} ClientOptions
 * @property {boolean} [fetch=false] When set to true, will fetch a Guild before emitting an event. Requires `servers.space` be installed.
 * @property {number[]} [ignoreEvents=[]] An array of event numbers to ignore. These can be:
 * 2 -> Server View
 * 3 -> Server Invite
 * 4 -> Server Upvote
 * @property {boolean} [raw=false] When set to true, returns the raw object of the guild. Requires {@link ClientOptions#fetch} be true.
 * @property {string[]} [tokens=[]] An array of bot tokens provided from serverlist.space to receive the bot's events from.
 */
exports.ClientOpts = {
	fetch: false,
	ignoreEvents: [],
	raw: false,
	tokens: [],
};