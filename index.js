const express = require("express");
const bodyParser = require("body-parser");
const graphQlHttp = require("express-graphql");
const { buildSchema } = require("graphql");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Event = require("./models/event");
const User = require("./models/user");

const app = express();
const port = process.env.PORT || 4000;
const uri =
  "mongodb+srv://gogo:dodo2121@cluster1-ktep3.gcp.mongodb.net/test?retryWrites=true&w=majority";
mongoose.connect(uri, { useNewUrlParser: true, useCreateIndex: true });
const connection = mongoose.connection;
connection.once("open", () => console.log("MongoDB connection is successful"));

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
  type User {
    _id: ID!
    name: String!
    email: String!
    password: String
  }
  input EventInput {
    title: String!
    description: String!
    price: Float!
    date: String!
  }
  input UserInput {
    name: String!
    email: String!
    password: String!
  }
  type RootQuery {
events: [Event!]!
  }
  type RootMutation {
createEvent(eventInput: EventInput): Event
createUser(userInput: UserInput): User
  }
  schema {
    query: RootQuery
    mutation: RootMutation
  }`),
      rootValue: {
        events: () => {
          return Event.find()
            .then(events => {
              return events.map(event => {
                return { ...event._doc, _id: event.id };
              });
            })
            .catch(err => {
              throw err;
            });
        },
        createEvent: args => {
          const event = new Event({
            title: args.eventInput.title,
            description: args.eventInput.description,
            price: +args.eventInput.price,
            date: new Date(args.eventInput.date),
            creator: "5d66f7e3d64c1f203531bc71"
          });
          let createdEvent;
          return event
            .save()
            .then(result => {
              createdEvent = { ...result._doc, _id: result.id };
              return User.findById("5d66f7e3d64c1f203531bc71")
            })
            .then(user => {
              if (!user) {
                throw new Error("User not found!");
              }
              user.createdEvents.push(event.id)
              return user.save()
            })
            .then(result => {
              return createdEvent
            })
            .catch(err => {
              console.log(err);
              throw err;
            });
        },
        createUser: args => {
         return User.findOne({ email: args.userInput.email })
            .then(user => {
              if (user) {
                throw new Error("A user with that email exists already!");
              }
              return bcrypt.hash(args.userInput.password, 12);
            })
            .then(hashedPassword => {
              const user = new User({
                name: args.userInput.name,
                email: args.userInput.email,
                password: hashedPassword
              });
              return user.save();
            })
            .then(result => {
              return { ...result._doc, password: null, _id: result.id };
            })
            .catch(err => {
              throw err;
            });
        }
      },
      graphiql: true
    })
  )
  .listen(port, () => console.log(`Listening on port ${port}`));
