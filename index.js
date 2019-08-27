const express = require('express');
const bodyParser = require('body-parser');
const graphQlHttp = require('express-graphql');
const { buildSchema } = require('graphql');

const app = express();
const port = process.env.PORT || 4000;

const events = [];

app
  .use(bodyParser.json())
  .use(
    "/graphql",
    graphQlHttp({
      schema: buildSchema(`
  type Event {
    _id: ID!
    title: String!
    description: String!
    price: Float!
    date: String!
  }
  input EventInput {
    title: String!
    description: String!
    price: Float!
    date: String!
  }
  type RootQuery {
events: [Event!]!
  }
  type RootMutation {
createEvent(eventInput: EventInput): String
  }
  schema {
    query: RootQuery
    mutation: RootMutation
  }`),
      rootValue: {
        events: () => {
          return events;
        },
        createEvent: args => {
          const event = {
            _id: Math.random().toString(),
            title: args.title,
            description: args.description,
            price: +args.price,
            date: new Date().toISOString()
          };
          events.push(event)
        }
      },
      graphiql: true
    })
  )
  .listen(port, () => console.log(`Listening on port ${port}`));