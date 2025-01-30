/*
  Importing necessary modules
*/
const express = require("express");
const app = express();
const path = require("path");
const logger = require("morgan");
const methodOverride = require("method-override");
// connection to our database
const connectToMongoDb = require("./database/connectToMongoDb");
const sessions = require('express-session');
const cookieParser = require('cookie-parser');
const connectedStore = require('connect-mongo');
const dotenv = require('dotenv');

const usersRouter = require('./routes/api/usersRouter')

/*
  8. Set up necessary modules for login sessions
*/



/*
  Setting up middleware
*/
// view engine settings
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
// Logging every request in the terminal
app.use(logger("dev"));
// Read incoming requests properly
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
// We can use HTML methods with back-end methods smoothly
app.use(methodOverride("_method"));


/*
  9. Set up cookie parser middleware
*/
dotenv.config();
app.use(cookieParser(process.env.COOKIE_SECRET));


/*
  10. Set up the login session
*/

const store = connectedStore.create({
  mongoUrl: process.env.MONGODB_URI,
  collectionName: 'sessions'
});

const oneDay = 1000 * 60 * 60 * 24; // milliseconds in one day

app.use(sessions({
  store: store,
  resave: false, 
  saveUninitialized: true,
  secret: process.env.COOKIE_SECRET,
  cookie: {maxAge: oneDay}
}))


/*
  Connecting routers, using URL extensions
*/
// Back-end
const pokemonRouter = require("./routes/api/pokemonRouter");
app.use("/api/pokemons", pokemonRouter);



/*
4. Plug in the user router
*/
app.use('/api/users', usersRouter);

// Front-end
const viewsRouter = require("./routes/viewRouters/viewRouter");
app.use("/", viewsRouter);



/*
  Turning the server on
*/
const PORT = 3000;

app.listen(PORT, () => {
  console.log(`server is on ${PORT}`);

  connectToMongoDb();
});
