const express = require('express')
const expressGraphQL = require('express-graphql')
const {
	GraphQLSchema, 
	GraphQLObjectType,
	// GraphQLObjectType is Used for many things: 
	// -	declaring custom types (like "Book") 
	// -	declaring the Root Query 
	// -	declaring the Toot Mutation
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
		// This one is a relationship to another vertice
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
	// Here every "fields" entry is actually a query, 
	// unlike when defining Types where every 'fields' entry is actually a "field" on that type
		
		// Query a Book by id			 
		book: {
			type: BookType,
			args: {
				id: {type:GraphQLInt}
			},
			resolve: (parent, args) => data.books.find(book=>book.id===args.id)
		},
		// Query all Books
		books: {
			type: GraphQLList(BookType),
			description: 'A list of books',
			resolve: () => data.books
		},
		// Query an author by id
		author: {
			type: AuthorType,
			args: {
				id: {type:GraphQLInt}
			},
			resolve:(parent, args) => data.authors.find(author=>author.id===args.id)
		},
		// Query all authors
		authors: {
			type: GraphQLList(AuthorType),
			description: 'A list of authors',
			resolve: () => data.authors
		}
	})
})

const RootMutationType = new GraphQLObjectType({
	name: 'Mutation',
	description: 'The root mutation',
	fields: ()=>({
		// Here every "field" entry is a particular mutation
		addBook: {
			type: BookType,
			description: 'Add a new book',
			args:{
				name: {type: GraphQLNonNull(GraphQLString)},
				authorId: {type: GraphQLNonNull(GraphQLInt)}
			},
			resolve: (parent, args) =>{ 
				const book = {
					id: ++data.books.length, 
					name: args.name,
					authorId: args.authorId
				} 
				data.books.push(book)
				return book
			}

		}
	})

})


// ------------ Defining the schema ----------------
const schema = new GraphQLSchema({
	query: RootQueryType,
	mutation: RootMutationType
});

// Plug to express
app.use('/graphql', expressGraphQL({
	schema: schema,
	graphiql: true
}))

app.listen(8052, (req, res) => console.log('Rannninga'))