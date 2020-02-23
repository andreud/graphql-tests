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

// ------------ Defining Custom Types -----------------------
const BookType = new GraphQLObjectType({
	name: 'Book',
	description: 'This represents a book, books have authors',
	fields: () => ({
		// No need to define a 'resolve' method in these first 3 
		id: { type: GraphQLNonNull(GraphQLInt) }, 
		name: { type: GraphQLNonNull(GraphQLString) },
		authorId: { type: GraphQLNonNull(GraphQLInt) },
		// This one is a relationship to another vertice, so it does need resolve method
		author: { 
			type: AuthorType,
			resolve: (parentBook, args) => {
				return data.authors.find(author=>author.id===parentBook.authorId)
			}
		}
	})
})

const AuthorType = new GraphQLObjectType({
	name: 'Author',
	description: 'Someone who worte a book',
	fields: () => ({
		id: {type:GraphQLNonNull(GraphQLInt)},
		name: {type:GraphQLNonNull(GraphQLString)},
		books: {
			type: GraphQLList(BookType),
			resolve: (thisAuthor) => {
				return data.books.filter(book=>book.authorId===thisAuthor.id)
			}
		}
	})

})

// ------------- Defining the queries we want available ----------------------
const RootQueryType = new GraphQLObjectType({
	name: 'TheRootQuery',
	description: 'This is the root query (top level)',
	fields: () => ({
		book: {
			type: BookType,
			args: {
				id: {type:GraphQLInt}
			},
			resolve: (parent, args) => data.books.find(book=>book.id===args.id)
		},
		books: {
			type: GraphQLList(BookType),
			description: 'A list of books',
			resolve: () => data.books
		},
		authors: {
			type: GraphQLList(AuthorType),
			description: 'A list of authors',
			resolve: () => data.authors
		}
	})
})

// ------------ Defining the schema ----------------
const schema = new GraphQLSchema({
	query: RootQueryType
});

// Plug to express
app.use('/graphql', expressGraphQL({
	schema: schema,
	graphiql: true
}))

app.listen(8052, (req, res) => console.log('Rannninga'))