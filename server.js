const express = require('express')
const expressGraphQL = require('express-graphql')
const {
	GraphQLSchema, 
	// GraphQLObjectType is Used for BOTH: declaring custom types (like "Book") 
	// AND declaring the Root Query:
	GraphQLObjectType,  
	GraphQLNonNull,
	GraphQLInt,
	GraphQLString,
	GraphQLList
} = require('graphql') 

const app = express()

const data = require('./data.js')
//console.log(data)

// Defining Custom Types
const BookType = new GraphQLObjectType({
	name: 'Book',
	description: 'This represents a book, books have authors',
	fields: () => ({
		// No need to define a 'resolve' method in these (since making a Type, not a Query)
		id: { type: GraphQLNonNull(GraphQLInt) }, 
		name: { type: GraphQLNonNull(GraphQLString) },
		authorId: { type: GraphQLNonNull(GraphQLInt) }
	})
})

// Defining the queries we want available
const RootQueryType = new GraphQLObjectType({
	name: 'TheRootQuery',
	description: 'This is the root query (top level)',
	fields: () => ({
		books: {
			type: GraphQLList(BookType),
			description: 'Alist of books',
			resolve: () => data.books
		}
	})
})

// Defining the schema
const schema = new GraphQLSchema({
	query: RootQueryType
});

// Plug to express
app.use('/graphql', expressGraphQL({
	schema: schema,
	graphiql: true
}))

app.listen(8052, (req, res) => console.log('Rannninga'))