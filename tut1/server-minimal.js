const express = require('express')
const expressGraphQL = require('express-graphql')
const {GraphQLSchema, GraphQLObjectType, GraphQLString} = require('graphql') 

const app = express()

const schema = new GraphQLSchema({
	query: new GraphQLObjectType({
		name: 'Hellou', // no puede contener espacios
		fields: () => ({
			dummyMessage:{
				type: GraphQLString,
				resolve: () => 'Hola, buenas! que tal?'
			}
		})
	})
})

app.use('/graphql', expressGraphQL({
	schema: schema,
	graphiql: true
}))

app.listen(8051, (req, res)=> console.log('Rannninga'))