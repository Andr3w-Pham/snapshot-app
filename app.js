// requires express package
const express = require('express');
const app = express();
//handlebar package to render views
const exphbs  = require('express-handlebars');

// mongoose
const mongoose = require('mongoose');

// require body parser to parse through the form content
const bodyParser = require('body-parser');
// image uploader start
// const multer = require('multer');
// const path  = require('path');
// image uploader end
const methodOverride = require('method-override');
//use express-session to maintain a user's session.
const session = require('express-session');

// flash messages
const flash = require('connect-flash');

const passport = require('passport');
const Instafeed = require("instafeed");

// bring in the helper ensure authenticated function
const {ensureAuthenticated} = require('./helper/auth')

const db = require('./config/database')
// if on production use production port else use 3000
const port = process.env.PORT || 3000;

// hbs helper
const { truncate, formatDate } = require('./helper/hbs')

// require model
require("./models/User");
require("./models/Post");

// Load routes
const index = require("./routes/index");
const users = require('./routes/users');
const posts = require('./routes/posts');

// load passport middleware
require("./config/passport")(passport);
// load routes
const auth = require("./routes/auth");

///////////////////////////////////////////////////////////////////////////////////////////////////

// connect to the mongo // Db
mongoose.connect(db.mongoURI, {useNewUrlParser: true})
.then(() => console.log('Connected to DB'))
.catch((err) => console.log(err));

//////////////////////////////////////////////////////////////
// ALL Middlewaress Starts here
// middleware for static css files
app.use(express.static('public'));
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

// middleware for express handlebars
app.engine(
  "handlebars",
  exphbs({
    // include the handlbar helpers in the middleware
    helpers: {
      truncate: truncate,
      formatDate: formatDate
    },
    defaultLayout: "main"
  })
);
app.set('view engine', 'handlebars');

// override with POST having ?_method=DELETE
app.use(methodOverride('_method'));


// express-session middleware must always be placed BEFORE! passport middleware
app.set('trust proxy', 1) // trust first proxy
app.use(session({
  secret: 'secure',
  resave: false,
  saveUninitialized: true
}))

// passport middleware
app.use(passport.initialize());
app.use(passport.session());

// middleware for flash messages
app.use(flash());

app.use((req, res, next) => {
  // Declare a global variable for success msg
  res.locals.success_msg = req.flash('success_msg');
  //Declare a global variable for error msg
  res.locals.error_msg = req.flash('error_msg');
  //Declare a global variable for user
  res.locals.user = req.user;
  next();
})

// End of all Middlewares
////////////////////////////////////////////////////////////////////////////////

// Whenever you hit a route called /users it goes and look for the variable users [const users = require('./routes/users')]
app.use("/", index);
app.use("/auth", auth);
app.use('/users', users);
app.use('/posts', posts);



// start a server
app.listen(port, () => console.log(`Server started on port ${port}`));

///////////////////////////////////////////////////////////////////////////////
