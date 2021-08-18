require('dotenv').config();
const { ApolloServer, PubSub } = require('apollo-server');
const nodeid = require('node-id');
const bcrypt = require('bcrypt-nodejs');
// Error handling
const {
	ERRORS,
	ERROR_AUTHENTICATION_DATA_IS_MISSING,
	errorDescriptor,
	ERROR_INTERNAL_SERVER_ERROR,
} = require('./errors');
const { formatError } = require('./errors/formatError');

const EVENTS = require('./src/events');
const { typeDefs } = require('./src/schema');

const generatePassword = require('./src/generatePassword');
const checkPassword = require('./src/checkPassword');

const users = [];

const resolvers = {
	Subscription: {
		registrationSuccess: {
			subscribe: (_, __, { pubsub }) =>
				pubsub.asyncIterator(EVENTS.REGISTRATION_SUCCESS),
		},
		loginSuccess: {
			subscribe: (_, __, { pubsub }) =>
				pubsub.asyncIterator(EVENTS.LOGIN_SUCCESS),
		},
	},
	User: {
		firstLetterOfUsername: (parent) => {
			return parent.username ? parent.username[0] : null;
		},
	},
	Query: {
		hello: (parent, { name }) => {
			return `hey ${name}`;
		},
		user: (_, { getUser: { id } }) => users.find((user) => user.id === id),
		errorLogs: () => [
			{
				field: 'username',
				message: 'bad',
			},
			{
				field: 'username2',
				message: 'bad2',
			},
		],
		users: () => users,
	},
	Mutation: {
		login: async (parent, { userInfo: { username, password } }, { pubsub }) => {
			// check the password
			if (username && password) {
				if (await checkPassword(username, password, users)) {
					pubsub.publish(EVENTS.LOGIN_SUCCESS, {
						loginSuccess: `Welcome back, ${username}`,
					});
					return username;
				} else {
					throw new Error(errorDescriptor(ERROR_INTERNAL_SERVER_ERROR));
				}
			} else {
				throw new Error(errorDescriptor(ERROR_AUTHENTICATION_DATA_IS_MISSING));
			}
		},
		register: async (
			_,
			{ userInfo: { username, password, age, admin } },
			{ pubsub }
		) => {
			if (username && password) {
				const pass = await generatePassword(password);
				if (pass) {
					const user = {
						id: nodeid(),
						username,
						password: pass,
						age,
						admin,
					};
					users.push(user);
					pubsub.publish(EVENTS.REGISTRATION_SUCCESS, {
						registrationSuccess: user,
					});
					console.log(users);
					return {
						user,
					};
				} else {
					throw new Error(errorDescriptor(ERROR_INTERNAL_SERVER_ERROR));
				}
			} else {
				throw new Error(errorDescriptor(ERROR_AUTHENTICATION_DATA_IS_MISSING));
			}
		},
	},
};

const pubsub = new PubSub();

const server = new ApolloServer({
	typeDefs,
	resolvers,
	context: ({ req, res }) => ({ req, res, pubsub }),
	// customFormatErrorFn: formatError,
	formatError,
});

const port = process.env.PORT;

server.listen(port).then(({ url }) => console.log(`Server started at ${url}`));
