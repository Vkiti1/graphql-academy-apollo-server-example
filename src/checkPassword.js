const checkPassword = (username, password, users) => {
	console.log(users);
	return new Promise((resolve, reject) => {
		const user = users.find((user) => user.username === username);
		if (user.password === password) {
			resolve(user);
		} else {
			reject(false);
		}
	});
};

module.exports = checkPassword;
