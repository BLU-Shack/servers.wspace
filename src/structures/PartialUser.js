/**
 * Represents a user with limited information.
 * @type {object}
 */
class PartialUser {
	/**
	 * @param {object} obj
	 */
	constructor(obj) {
		/**
		 * The user's Discord avatar.
		 * @type {string}
		 */
		this.avatar = obj.avatar;

		/**
		 * The user's Discord discriminator.
		 * @type {string}
		 */
		this.discriminator = obj.discriminator;

		/**
		 * The user's Discord ID.
		 * @type {string}
		 */
		this.id = obj.id;

		/**
		 * The user's Discord username.
		 * @type {string}
		 */
		this.username = obj.username;
	}

	/**
	 * The user's page on serverlist.space
	 * @readonly
	 * @type {string}
	 */
	get page() {
		return `https://serverlist.space/user/${this.id}`;
	}

	/**
	 * The user's Discord Tag.
	 * @readonly
	 * @type {string}
	 */
	get tag() {
		return `${this.username}#${this.discriminator}`;
	}

	/**
	 * Returns text that Discord recognizes as a user mention.
	 * @returns {string}
	 */
	toString() {
		return `<@${this.id}>`;
	}
}

module.exports = PartialUser;