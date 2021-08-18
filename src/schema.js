const { gql } = require('apollo-server');

const typeDefs = gql`
	type Query {
		hello(name: String): String
		user: User
		errorLogs: [Error!]!
		users: [User!]
	}

	type User {
		id: ID!
		username: String!
		password: String!
		firstLetterOfUsername: String
		age: Int
		admin: Boolean
	}

	type Error {
		field: String!
		message: String!
	}

	type RegisterResponse {
		user: User
	}

	input GetUser {
		id: ID!
	}

	input UserInfo {
		username: String!
		password: String!
		age: Int
		admin: Boolean
	}

	type Mutation {
		register(userInfo: UserInfo!): RegisterResponse!
		login(userInfo: UserInfo!): String!
	}

	type Subscription {
		registrationSuccess: User!
		loginSuccess: String!
	}
`;

module.exports = {
	typeDefs,
};
