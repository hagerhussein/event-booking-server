const express = require("express");
const bodyParser = require("body-parser");
const graphQlHttp = require("express-graphql");
const mongoose = require("mongoose");

const graphQlSchema = require("./graphql/schema/index");
const graphQlResolvers = require("./graphql/resolvers/index");
const isAuth = require('./middleware/is-auth');

const app = express();
const port = process.env.PORT || 4000;

const uri =
  "mongodb+srv://gogo:dodo2121@cluster1-ktep3.gcp.mongodb.net/test?retryWrites=true&w=majority";
mongoose.connect(uri, { useNewUrlParser: true, useCreateIndex: true });
const connection = mongoose.connection;
connection.once("open", () => console.log("MongoDB connection is successful"));

app
  .use(bodyParser.json())
  .use(isAuth)
  .use(
    "/graphql",
    graphQlHttp({
      schema: graphQlSchema,
      rootValue: graphQlResolvers,

      graphiql: true
    })
  )
  .listen(port, () => console.log(`Listening on port ${port}`));
