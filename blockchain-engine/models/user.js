// Modules

/*
 * Class
 */
class User {

    // Constructor
    constructor(user_id, public_key, private_key) {
        this.user_id = user_id;
        this.public_key = public_key;
		this.private_key = private_key;
    }

}

// Export as module
module.exports = User;