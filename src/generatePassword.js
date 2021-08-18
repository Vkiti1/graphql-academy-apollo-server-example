const bcrypt = require('bcrypt-nodejs');

const generatePassword = (password) => {
	return new Promise((resolve, reject) => {
		bcrypt.genSalt(10, (err, salt) => {
			if (err) {
				reject(false);
			}
			bcrypt.hash(password, salt, null, (err, hash) => {
				if (err) {
					reject(false);
				}
				resolve(hash);
			});
		});
	});
};

module.exports = generatePassword;
