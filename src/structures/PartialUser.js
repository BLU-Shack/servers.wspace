class PartialUser {
	constructor(obj) {
		this.avatar = obj.avatar;
		this.discriminator = obj.discriminator;
		this.id = obj.id;
		this.username = obj.username;
	}

	get page() {
		return `https://serverlist.space/user/${this.id}`;
	}

	get tag() {
		return `${this.username}#${this.discriminator}`;
	}

	toString() {
		return `<@${this.id}>`;
	}
}

module.exports = PartialUser;